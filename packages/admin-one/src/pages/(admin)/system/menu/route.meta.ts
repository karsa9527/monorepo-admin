import type { RouteMetaInput } from '@office-admin/lib/router';

export default {
  title: '菜单管理',
  icon: 'menu',
  permission: 'system:menu:list',
  order: 3,
} satisfies RouteMetaInput;
