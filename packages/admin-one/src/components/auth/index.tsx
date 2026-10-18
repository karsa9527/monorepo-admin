import { observer } from 'mobx-react-lite';
import type { ReactNode } from 'react';
import { usePermissionStore } from '@/stores';

export interface AuthProps {
  /** 权限点：字符串或数组 */
  code?: string | string[];
  /** 角色：字符串或数组 */
  role?: string | string[];
  /** 多个权限点时的判定方式：any=满足其一，all=全部满足 */
  mode?: 'any' | 'all';
  /** 无权限时的占位内容，默认不渲染 */
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * 按钮级权限组件
 *
 * <Auth code="system:user:create">
 *   <Button type="primary">新增</Button>
 * </Auth>
 */
export const Auth = observer(function Auth({
  code,
  role,
  mode = 'any',
  fallback = null,
  children,
}: AuthProps) {
  const permission = usePermissionStore();

  const codes = code ? (Array.isArray(code) ? code : [code]) : undefined;
  const roles = role ? (Array.isArray(role) ? role : [role]) : undefined;

  let pass = true;
  if (codes?.length) {
    pass = mode === 'all' ? permission.hasAll(codes) : permission.hasAny(codes);
  }
  if (pass && roles?.length) {
    pass =
      mode === 'all'
        ? roles.every((r) => permission.hasRole(r))
        : roles.some((r) => permission.hasRole(r));
  }

  return <>{pass ? children : fallback}</>;
});

/** 权限 hook：在组件内做条件判断 */
export function usePermission() {
  const permission = usePermissionStore();
  return {
    has: permission.has,
    hasAny: permission.hasAny,
    hasAll: permission.hasAll,
    hasRole: permission.hasRole,
    permissions: permission.permissions,
    roles: permission.roles,
    isSuperAdmin: permission.isSuperAdmin,
  };
}

/** HOC：给组件加权限控制 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  code?: string | string[],
  fallback: ReactNode = null,
) {
  const Wrapped = observer((props: P) => (
    <Auth code={code} fallback={fallback}>
      <Component {...props} />
    </Auth>
  ));
  Wrapped.displayName = `withAuth(${Component.displayName || Component.name || 'Component'})`;
  return Wrapped;
}

export default Auth;
