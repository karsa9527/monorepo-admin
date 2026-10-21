import { makeAutoObservable } from 'mobx';
import type { RootStore } from './index';
import { constantRoutes } from '@office-admin/lib/router';
import type { AppRouteObject } from '@office-admin/lib/router';
import {
  buildMenuItems,
  filterRoutes,
  findFirstAccessiblePath,
  flattenRoutes,
  type MenuNode,
} from '@office-admin/lib/router';
import type { FlatRoute } from '@office-admin/lib/router';

/** 超级管理员通配符 */
export const SUPER_PERMISSION = '*';

/**
 * 权限 store
 *
 * 三级权限模型：
 * 1. 接口级：请求库自动注入 token，401 由 hook 统一处理
 * 2. 路由级：filterRoutes 过滤掉无权限的路由，无权限访问跳转 403
 * 3. 按钮级：<Auth code="system:user:create"> 或 usePermission().has()
 */
export class PermissionStore {
  root: RootStore;

  /** 权限点列表 */
  permissions: string[] = [];
  /** 角色列表 */
  roles: string[] = [];

  constructor(root: RootStore) {
    this.root = root;
    makeAutoObservable(this, { root: false }, { autoBind: true });
  }

  get isSuperAdmin(): boolean {
    return this.roles.includes('admin') || this.permissions.includes(SUPER_PERMISSION);
  }

  setPermissions(list: string[]) {
    this.permissions = [...list];
  }

  setRoles(list: string[]) {
    this.roles = [...list];
  }

  reset() {
    this.permissions = [];
    this.roles = [];
  }

  /** 是否拥有某个权限点 */
  has(code?: string): boolean {
    if (!code) return true;
    if (this.isSuperAdmin) return true;
    return this.permissions.includes(code);
  }

  /** 满足其一即可 */
  hasAny(codes?: string[]): boolean {
    if (!codes?.length) return true;
    if (this.isSuperAdmin) return true;
    return codes.some((c) => this.permissions.includes(c));
  }

  /** 必须全部满足 */
  hasAll(codes?: string[]): boolean {
    if (!codes?.length) return true;
    if (this.isSuperAdmin) return true;
    return codes.every((c) => this.permissions.includes(c));
  }

  /** 是否拥有某个角色 */
  hasRole(role: string): boolean {
    return this.roles.includes(role);
  }

  /** 校验路由是否可访问（路由守卫使用） */
  canAccess(meta?: AppRouteObject['meta']): boolean {
    if (!meta) return true;
    const { permission, roles } = meta;
    if (permission) {
      const codes = Array.isArray(permission) ? permission : [permission];
      if (!this.hasAny(codes)) return false;
    }
    if (roles?.length && !roles.some((r) => this.hasRole(r))) return false;
    return true;
  }

  /** 按权限过滤后的路由树 */
  get accessibleRoutes(): AppRouteObject[] {
    return filterRoutes(
      constantRoutes,
      (code) => this.has(code),
      (role) => this.hasRole(role),
    );
  }

  /** 菜单树（已按权限过滤 + 排序） */
  get menus(): MenuNode[] {
    return buildMenuItems(this.accessibleRoutes);
  }

  /** 扁平路由表（面包屑 / 页签匹配） */
  get flatRoutes(): FlatRoute[] {
    return flattenRoutes(this.accessibleRoutes);
  }

  /** 登录后默认跳转的第一个可访问页面 */
  get homePath(): string {
    return findFirstAccessiblePath(this.accessibleRoutes) || '/403';
  }
}
