import { env } from '@office/lib';
import Loading from '@office/components/loading';
import {
  constantRoutes,
  createAppRouter as createLibRouter,
  toRouteObjects,
  type AppRouter,
} from '@office/lib/router';
import AuthGuard from './auth-guard';

/**
 * 应用路由装配层
 *
 * 约定式扫描、路由树 -> RouteObject、懒加载、重定向等通用逻辑都在
 * @office/lib/router 里；这里只负责把「应用自己的东西」注入进去：
 *  - guard    : 依赖登录态 / 权限 store 的路由守卫
 *  - fallback : 应用的 Loading 组件
 *  - mode     : hash / browser（由环境变量决定）
 *
 * 新增页面依然只需在 src/pages 下建目录，无需改这个文件。
 */
export function createAppRouter(): Promise<AppRouter> {
  return createLibRouter({
    routes: constantRoutes,
    guard: AuthGuard,
    fallback: <Loading tip="页面加载中…" />,
    mode: env.ROUTER_MODE,
    // 部署在子路径（如 /admin/）时打开：
    // basename: import.meta.env.BASE_URL,
  });
}

export { constantRoutes, toRouteObjects };
export type { AppRouter };
