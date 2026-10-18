import { useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { observer } from 'mobx-react-lite';
import { useAuthStore, usePermissionStore } from '@/stores';
import Loading from '@office/components/loading';
import { Redirect, type RouteMeta } from '@office/lib/router';

export interface AuthGuardProps {
  meta?: RouteMeta;
  children: ReactNode;
}

/**
 * 路由守卫
 *
 * 1. bootstrap 未完成时展示首屏 loading，避免刷新时闪一下登录页
 * 2. 无 meta 的节点是纯布局容器，不做校验，交给子路由
 * 3. ignoreAuth 路由直接放行（登录页 / 403 / 404）
 * 4. 未登录 -> 跳转登录页，并带上来源地址
 * 5. 已登录但无权限 -> 跳转 403
 *
 * 跳转统一走 <Redirect>（startTransition + effect），
 * 保证目标页面为懒加载时不会在同步渲染中 suspend。
 */
export const AuthGuard = observer(function AuthGuard({ meta, children }: AuthGuardProps) {
  const auth = useAuthStore();
  const permission = usePermissionStore();
  const location = useLocation();

  if (!auth.initialized) {
    return <Loading tip="正在初始化…" />;
  }

  // 布局容器（route.meta.ts 缺省）不承担权限，避免把子页面的公共属性
  // 误判成「需要登录」，例如 (auth) 组下的登录页
  if (!meta) {
    return <>{children}</>;
  }

  if (meta.ignoreAuth) {
    return <>{children}</>;
  }

  if (!auth.isLogin) {
    return <Redirect to="/login" state={{ from: location.pathname + location.search }} />;
  }

  if (!permission.canAccess(meta)) {
    return <Redirect to="/403" />;
  }

  return <>{children}</>;
});

export default AuthGuard;
