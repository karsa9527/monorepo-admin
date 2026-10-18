/**
 * 权限点字典
 * 与后端约定保持一致，用于角色授权与前端按钮级控制
 */
export interface PermissionItem {
  code: string;
  label: string;
  group: string;
}

export const PERMISSION_LIST: PermissionItem[] = [
  { code: 'dashboard:view', label: '查看仪表盘', group: '仪表盘' },
  { code: 'system:user:list', label: '查看用户列表', group: '用户管理' },
  { code: 'system:user:create', label: '新增用户', group: '用户管理' },
  { code: 'system:user:update', label: '编辑用户', group: '用户管理' },
  { code: 'system:user:delete', label: '删除用户', group: '用户管理' },
  { code: 'system:user:export', label: '导出用户', group: '用户管理' },
  { code: 'system:role:list', label: '查看角色列表', group: '角色管理' },
  { code: 'system:role:update', label: '编辑角色', group: '角色管理' },
  { code: 'system:menu:list', label: '查看菜单', group: '菜单管理' },
  { code: 'system:log:list', label: '查看操作日志', group: '日志管理' },
];

/** 按模块分组，用于授权弹窗的 Checkbox.Group */
export const PERMISSION_GROUPS = PERMISSION_LIST.reduce<Record<string, PermissionItem[]>>(
  (acc, item) => {
    (acc[item.group] ??= []).push(item);
    return acc;
  },
  {},
);

/** 权限码 -> 中文名 */
export const PERMISSION_LABEL_MAP = PERMISSION_LIST.reduce<Record<string, string>>((acc, item) => {
  acc[item.code] = item.label;
  return acc;
}, {});
