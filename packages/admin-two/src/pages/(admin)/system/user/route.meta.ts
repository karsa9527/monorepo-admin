import type { RouteMetaInput } from '@office/lib/router';

export default {
  title: '用户管理',
  icon: 'team',
  permission: 'system:user:list',
  order: 1,
} satisfies RouteMetaInput;
