import type { RouteMetaInput } from '@office-admin/lib/router';

export default {
  title: '角色管理',
  icon: 'key',
  permission: 'system:role:list',
  order: 2,
} satisfies RouteMetaInput;
