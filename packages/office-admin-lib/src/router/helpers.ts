import type { ReactNode } from 'react';
import type { AppRouteObject, FlatRoute, RouteMeta } from './types';

/** 菜单节点（UI 层再转成 antd Menu items） */
export interface MenuNode {
  key: string;
  label: string;
  icon?: ReactNode;
  meta?: RouteMeta;
  children?: MenuNode[];
}

/** 拼接完整路径，避免重复斜杠 */
export function joinPath(parent: string, child: string): string {
  if (child.startsWith('/')) return child;
  return `${parent.replace(/\/$/, '')}/${child}`;
}

/**
 * 按权限过滤路由树
 * 规则：
 *  - 无 permission / roles 配置的节点：所有人可见（公共路由）
 *  - permission 数组：满足其一即可；字符串：必须满足
 *  - 父节点被过滤则整棵子树丢弃
 *  - 子节点全部被过滤且父节点非菜单项，则父节点一并丢弃
 */
export function filterRoutes(
  routes: AppRouteObject[],
  hasPermission: (code: string) => boolean,
  hasRole: (role: string) => boolean,
): AppRouteObject[] {
  return routes.reduce<AppRouteObject[]>((acc, route) => {
    const { permission, roles } = route.meta ?? {};

    let pass = true;
    if (permission) {
      const codes = Array.isArray(permission) ? permission : [permission];
      pass = codes.some((c) => hasPermission(c));
    }
    if (pass && roles?.length) {
      pass = roles.some((r) => hasRole(r));
    }
    if (!pass) return acc;

    const children = route.children
      ? filterRoutes(route.children, hasPermission, hasRole)
      : undefined;
    // 非 index 路由若无 children 且原本有 children，说明子路由全被过滤，父节点也不再需要
    if (route.children?.length && (!children || children.length === 0)) {
      return acc;
    }

    acc.push({ ...route, ...(children ? { children } : {}) });
    return acc;
  }, []);
}

/** 扁平化路由树，输出完整路径 + 面包屑链路 */
export function flattenRoutes(
  routes: AppRouteObject[],
  parentPath = '',
  parentCrumbs: Array<{ path: string; title: string }> = [],
): FlatRoute[] {
  const result: FlatRoute[] = [];

  routes.forEach((route) => {
    if (route.index) return;
    const fullPath = route.path?.startsWith('/')
      ? route.path
      : joinPath(parentPath, route.path ?? '');

    const crumbs = [...parentCrumbs];
    if (route.meta?.title) {
      crumbs.push({ path: fullPath, title: route.meta.title });
    }

    if (!route.children?.length) {
      result.push({ fullPath, meta: route.meta, breadcrumbs: crumbs });
      return;
    }

    // 父级若是布局容器（无 title），不产生叶子节点
    if (route.meta?.title && !route.meta?.hideChildrenInMenu) {
      result.push({ fullPath, meta: route.meta, breadcrumbs: crumbs });
    }
    result.push(...flattenRoutes(route.children, fullPath, crumbs));
  });

  return result;
}

/** 在路由树中查找第一个可访问的路径（登录后跳转用） */
export function findFirstAccessiblePath(routes: AppRouteObject[], parentPath = ''): string {
  for (const route of routes) {
    if (route.index) continue;
    // 登录页 / 403 / 404 不参与「首页」判定
    if (route.meta?.ignoreAuth) continue;

    const fullPath = route.path?.startsWith('/')
      ? route.path
      : joinPath(parentPath, route.path ?? '');
    const indexChild = route.children?.find((child) => child.index);

    // 约定式路由下，页面组件挂在 index 子路由上：有 element 即本节点就是页面
    if (indexChild?.element) return fullPath;

    if (route.children?.length) {
      const child = findFirstAccessiblePath(route.children, fullPath);
      if (child) return child;
      // 子页面都不可访问时，退回本节点的重定向配置
      if (indexChild?.redirect) return indexChild.redirect;
      continue;
    }

    if (route.redirect) return route.redirect;
    return fullPath;
  }
  return '';
}

/** 判断当前路径是否在白名单中（用于登录页跳转回原地址） */
export function matchRoutePath(pathname: string, routes: FlatRoute[]): FlatRoute | undefined {
  return (
    routes.find((r) => r.fullPath === pathname) ??
    routes.find((r) => pathname.startsWith(`${r.fullPath}/`))
  );
}

/**
 * 路由树 -> 菜单树
 * - 过滤 hideInMenu
 * - hideChildrenInMenu：父节点作为叶子展示
 * - 仅剩一个子节点且父级未设置 title 时，向上提升（避免多层嵌套）
 */
export function buildMenuItems(routes: AppRouteObject[], parentPath = ''): MenuNode[] {
  const nodes: MenuNode[] = [];

  routes.forEach((route) => {
    if (route.index) return;
    const meta = route.meta;
    const fullPath = route.path?.startsWith('/')
      ? route.path
      : joinPath(parentPath, route.path ?? '');

    // 无 title 的容器节点：直接下钻
    if (!meta?.title) {
      if (route.children?.length) nodes.push(...buildMenuItems(route.children, fullPath));
      return;
    }
    if (meta.hideInMenu) return;

    const children = meta.hideChildrenInMenu
      ? undefined
      : route.children?.length
        ? buildMenuItems(route.children, fullPath)
        : undefined;

    nodes.push({
      key: fullPath,
      label: meta.title,
      icon: meta.icon,
      meta,
      ...(children?.length ? { children } : {}),
    });
  });

  return nodes.sort((a, b) => (a.meta?.order ?? 99) - (b.meta?.order ?? 99));
}
