import type { RouteMetaInput } from '@office/lib/router';

export default {
  title: '仪表盘',
  icon: 'dashboard',
  permission: 'dashboard:view',
  order: 1,
  affix: true,
  keepAlive: true,
} satisfies RouteMetaInput;
