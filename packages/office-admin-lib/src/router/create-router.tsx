import { Suspense, type ComponentType, type ReactNode } from 'react';
import type { createHashRouter, RouteObject } from 'react-router-dom';
import { constantRoutes } from './fs-routes';
import Redirect from './redirect';
import type { AppRouteObject, RouteMeta } from './types';

/** 应用路由实例类型（hash / browser 共用） */
export type AppRouter = ReturnType<typeof createHashRouter>;

export interface RouteGuardProps {
  meta?: RouteMeta;
  children: ReactNode;
}

/**
 * 路由守卫组件类型
 *
 * 守卫通常依赖应用自身的登录态 / 权限 store，所以不放在本包里，
 * 由宿主应用通过 createAppRouter({ guard }) 注入。
 */
export type RouteGuard = ComponentType<RouteGuardProps>;

export interface ToRouteObjectsOptions {
  /** 每个路由节点的守卫；不传则不包裹（适合不需要鉴权的站点） */
  guard?: RouteGuard;
  /** 全局 Suspense fallback，通常传应用自己的 Loading 组件 */
  fallback?: ReactNode;
}

/**
 * AppRouteObject -> react-router RouteObject
 *
 * - redirect 转成过渡安全的 <Redirect>
 * - 有 guard 时给每个有 element 的节点包一层守卫
 * - 顶层节点 / 声明了 suspense 的节点需要自己的 Suspense 边界：
 *   布局内子路由的挂起由布局内部（如 BasicLayout 内容区）就近接管，
 *   避免切页时整个侧边栏被 fallback 顶掉
 */
export function toRouteObjects(
  routes: AppRouteObject[],
  depth = 0,
  options: ToRouteObjectsOptions = {},
): RouteObject[] {
  const { guard: Guard, fallback } = options;

  return routes.map((route) => {
    const raw: ReactNode = route.redirect ? <Redirect to={route.redirect} /> : route.element;
    const guarded = raw && Guard ? <Guard meta={route.meta}>{raw}</Guard> : raw;

    const needSuspense = route.suspense || depth === 0;
    // 目录级的 loading.tsx 优先于全局 fallback
    const suspenseFallback = route.fallback ?? fallback;
    const element = guarded ? (
      needSuspense ? (
        <Suspense fallback={suspenseFallback}>{guarded}</Suspense>
      ) : (
        guarded
      )
    ) : undefined;

    if (route.index) {
      return { index: true, element } as RouteObject;
    }
    return {
      path: route.path,
      element,
      children: route.children?.length
        ? toRouteObjects(route.children, depth + 1, options)
        : undefined,
    } as RouteObject;
  });
}

export interface CreateRouterOptions extends ToRouteObjectsOptions {
  /** 路由树，默认使用约定式扫描结果 constantRoutes */
  routes?: AppRouteObject[];
  /** 路由模式，默认 hash（静态托管 / 内嵌 iframe 场景更省心） */
  mode?: 'hash' | 'browser';
  /** 部署在子路径时使用，如 '/admin/' */
  basename?: string;
}

/**
 * 创建应用路由
 *
 * 路由表由 src/pages 目录结构自动生成（见 fs-routes.tsx）。
 * 配合 app.tsx 中 RouterProvider 的 v7_startTransition，
 * 导航期间的懒加载挂起会被当作过渡处理，不会触发
 * "A component suspended while responding to synchronous input"。
 */
export async function createAppRouter(options: CreateRouterOptions = {}): Promise<AppRouter> {
  const { routes = constantRoutes, mode = 'hash', basename, ...routeOptions } = options;
  const objects = toRouteObjects(routes, 0, routeOptions);

  if (mode === 'browser') {
    const { createBrowserRouter } = await import('react-router-dom');
    return createBrowserRouter(objects, { basename });
  }

  const { createHashRouter } = await import('react-router-dom');
  return createHashRouter(objects, { basename });
}
