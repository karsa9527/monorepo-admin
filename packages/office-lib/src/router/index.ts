/**
 * 约定式路由核心（与业务解耦，UI 由宿主注入）
 *
 * 宿主用法：
 *   createAppRouter({ guard: AuthGuard, fallback: <Loading />, mode: 'hash' })
 */
export { createAppRouter, toRouteObjects } from './create-router';
export type {
  AppRouter,
  CreateRouterOptions,
  RouteGuard,
  RouteGuardProps,
  ToRouteObjectsOptions,
} from './create-router';

export { constantRoutes, createRoutes } from './fs-routes';
export { default as Redirect } from './redirect';
export type { RedirectProps } from './redirect';
export { lazyPage } from './lazy-page';
export { iconMap, registerIcons, resolveIcon } from './icons';
export type { BuiltinIconName, IconName } from './icons';

export * from './helpers';
export * from './types';
