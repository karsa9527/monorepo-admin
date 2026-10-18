import type { ComponentType, LazyExoticComponent } from 'react';
import type { AppRouteObject, RouteMeta, RouteMetaInput } from './types';
import { lazyPage } from './lazy-page';
import { resolveIcon } from './icons';

/**
 * ============================================================
 * 约定式（文件系统）路由 —— 类似 Next.js App Router
 * ============================================================
 *
 * 目录即路由，新增页面只需新建文件夹，无需改任何路由表：
 *
 *   src/pages/(admin)/system/user/page.tsx  ->  /system/user
 *   src/pages/(auth)/login/page.tsx         ->  /login
 *   src/pages/(admin)/order/[id]/page.tsx   ->  /order/:id
 *
 * 约定文件：
 *   page.tsx        页面组件（默认导出）
 *   layout.tsx      该段的布局，替代默认 <Outlet />，子页面渲染在其内部
 *   route.meta.ts   该段的元信息（标题/图标/权限/排序/重定向），纯数据文件
 *   loading.tsx     该段的 Suspense fallback（同步加载，不可用懒加载组件）
 *   not-found.tsx   该段未匹配子路径时的兜底页
 *
 * 路径约定：
 *   (group)         路由组，仅影响布局归属，不进入 URL
 *   [id]            动态段        ->  :id
 *   [...slug]       通配段        ->  *
 *   _prefix         私有目录/文件，不参与路由
 */

/**
 * 约定式扫描的根目录。
 *
 * import.meta.glob 的 pattern 必须是静态字面量，无法从参数传入，
 * 因此这里固定为应用根目录下的 src/pages；宿主应用只要遵守该约定，
 * 就能直接复用整套路由生成器（两个 admin 应用都保持这一结构）。
 */
const ROOT = '/src/pages';

type PageModule = { default: ComponentType };

/** 页面 / 布局：懒加载，天然代码分割 */
const PAGE_FILES = import.meta.glob('/src/pages/**/page.tsx') as Record<
  string,
  () => Promise<PageModule>
>;
const LAYOUT_FILES = import.meta.glob('/src/pages/**/layout.tsx') as Record<
  string,
  () => Promise<PageModule>
>;
const NOT_FOUND_FILES = import.meta.glob('/src/pages/**/not-found.tsx') as Record<
  string,
  () => Promise<PageModule>
>;
/** loading 是 Suspense 的 fallback，若本身懒加载会二次挂起，因此同步引入 */
const LOADING_FILES = import.meta.glob('/src/pages/**/loading.tsx', {
  eager: true,
}) as Record<string, PageModule>;
/** meta 是纯数据，eager 扫描才能让菜单在页面代码加载前就拿到标题与权限 */
const META_FILES = import.meta.glob('/src/pages/**/route.meta.ts', { eager: true }) as Record<
  string,
  { default: RouteMetaInput }
>;

interface DirNode {
  /** 相对 ROOT 的原始目录分段（含路由组） */
  segments: string[];
  children: Map<string, DirNode>;
  page?: LazyExoticComponent<ComponentType>;
  layout?: LazyExoticComponent<ComponentType>;
  loading?: ComponentType;
  notFound?: LazyExoticComponent<ComponentType>;
  meta?: RouteMeta;
}

// ------------------------------------------------------------
// 路径解析
// ------------------------------------------------------------

/** '/src/pages/(admin)/system/user/page.tsx' -> ['(admin)','system','user'] */
function dirSegmentsOf(file: string): string[] {
  const rel = file.startsWith(`${ROOT}/`) ? file.slice(ROOT.length + 1) : file;
  const parts = rel.split('/');
  parts.pop();
  return parts;
}

/** 私有目录：以 _ 开头，不参与路由 */
function isPrivate(segment: string): boolean {
  return segment.startsWith('_');
}

/** 路由组：(name)，不进入 URL */
function isGroup(segment: string): boolean {
  return /^\(.+\)$/.test(segment);
}

/** 目录分段 -> react-router 路径分段 */
function toRouteSegment(segment: string): string {
  if (/^\[\.\.\.[^\]]+\]$/.test(segment)) return '*'; // [...slug]
  const dynamic = segment.match(/^\[([^\]]+)\]$/); // [id]
  return dynamic ? `:${dynamic[1]}` : segment;
}

function normalizeMeta(input?: RouteMetaInput): RouteMeta | undefined {
  if (!input) return undefined;
  return { ...input, icon: resolveIcon(input.icon) };
}

// ------------------------------------------------------------
// 目录树构建
// ------------------------------------------------------------

function ensureDir(root: DirNode, segments: string[]): DirNode {
  let node = root;
  segments.forEach((segment, index) => {
    let child = node.children.get(segment);
    if (!child) {
      child = { segments: segments.slice(0, index + 1), children: new Map() };
      node.children.set(segment, child);
    }
    node = child;
  });
  return node;
}

function collect(
  root: DirNode,
  files: Record<string, unknown>,
  attach: (node: DirNode, file: string) => void,
): void {
  Object.keys(files).forEach((file) => {
    const segments = dirSegmentsOf(file);
    if (segments.some(isPrivate)) return;
    attach(ensureDir(root, segments), file);
  });
}

// ------------------------------------------------------------
// 目录树 -> 路由树
// ------------------------------------------------------------

function sortRoutes(routes: AppRouteObject[]): AppRouteObject[] {
  return [...routes].sort((a, b) => {
    const orderA = a.meta?.order ?? 99;
    const orderB = b.meta?.order ?? 99;
    if (orderA !== orderB) return orderA - orderB;
    return (a.path ?? '').localeCompare(b.path ?? '');
  });
}

const NOT_FOUND_META: RouteMeta = {
  title: '页面不存在',
  hideInMenu: true,
  ignoreAuth: true,
};

/**
 * 页面节点缺省 meta
 * 没写 route.meta.ts 的页面不能变成「公共路由」，
 * 这里兜底成「需登录 + 不进菜单」，避免忘记配置导致越权访问
 */
function fallbackMeta(node: DirNode): RouteMeta | undefined {
  if (!node.page) return undefined;
  const name = [...node.segments].reverse().find((segment) => !isGroup(segment)) ?? 'page';
  return { title: name.replace(/^\[(\.\.\.)?(.+)\]$/, '$2'), hideInMenu: true };
}

/**
 * 目录树 -> 路由树
 * parentSegments 是父级已过滤路由组的段，用于把本节点路径裁成「相对父级」的一段，
 * 否则 react-router 会把父子路径再拼一次（如 /system/system/user）
 */
function buildRoute(node: DirNode, parentSegments: string[] = []): AppRouteObject | null {
  const ownSegments = node.segments.filter((s) => !isGroup(s)).map(toRouteSegment);
  const relativeSegments = ownSegments.slice(parentSegments.length);
  const path = relativeSegments.length ? relativeSegments.join('/') : undefined;
  const meta = node.meta ?? fallbackMeta(node);

  const children: AppRouteObject[] = [];

  if (node.page) {
    const Page = node.page;
    children.push({ index: true, element: <Page />, meta });
  } else if (meta?.redirect) {
    children.push({ index: true, redirect: meta.redirect, meta });
  }

  const subRoutes = [...node.children.values()]
    .map((child) => buildRoute(child, ownSegments))
    .filter((route): route is AppRouteObject => route !== null);
  children.push(...sortRoutes(subRoutes));

  if (node.notFound) {
    const NotFound = node.notFound;
    children.push({ path: '*', element: <NotFound />, meta: NOT_FOUND_META });
  }

  if (!children.length) return null;

  const Layout = node.layout;
  const Loading = node.loading;

  return {
    path,
    // 有 layout 时由其渲染子路由；没有则交给 react-router 默认的 Outlet 透传
    element: Layout ? <Layout /> : undefined,
    // 懒加载布局自身需要 Suspense 边界；有布局时子页面 suspend
    // 会由更近的布局内边界接管（BasicLayout 内容区）
    suspense: Boolean(Layout),
    // 只有目录里显式放了 loading.tsx 才在这里给 fallback；
    // 全局兜底由 createAppRouter 的 fallback 选项注入，本包不依赖任何 UI 组件
    fallback: Loading ? <Loading /> : undefined,
    meta,
    children,
  };
}

// ------------------------------------------------------------
// 对外入口
// ------------------------------------------------------------

export function createRoutes(): AppRouteObject[] {
  const tree: DirNode = { segments: [], children: new Map() };

  collect(tree, PAGE_FILES, (node, file) => {
    node.page = lazyPage(PAGE_FILES[file]);
  });
  collect(tree, LAYOUT_FILES, (node, file) => {
    node.layout = lazyPage(LAYOUT_FILES[file]);
  });
  collect(tree, NOT_FOUND_FILES, (node, file) => {
    node.notFound = lazyPage(NOT_FOUND_FILES[file]);
  });
  collect(tree, LOADING_FILES, (node, file) => {
    node.loading = LOADING_FILES[file].default;
  });
  collect(tree, META_FILES, (node, file) => {
    node.meta = normalizeMeta(META_FILES[file].default);
  });

  if (import.meta.env.DEV && tree.page) {
    console.warn(
      '[router] src/pages/page.tsx 不会被注册为路由。首页请放在路由组下，例如 src/pages/(admin)/route.meta.ts 配置 redirect。',
    );
  }

  const routes: AppRouteObject[] = [...tree.children.values()]
    .map((node) => buildRoute(node))
    .filter((route): route is AppRouteObject => route !== null);

  // 根目录的 not-found.tsx 作为全局兜底
  const GlobalNotFound = tree.notFound;
  if (GlobalNotFound) {
    routes.push({
      path: '*',
      element: <GlobalNotFound />,
      meta: NOT_FOUND_META,
      suspense: true,
    });
  }

  return routes;
}

/** 约定式扫描得到的路由表（模块加载时构建一次） */
export const constantRoutes: AppRouteObject[] = createRoutes();

export default constantRoutes;
