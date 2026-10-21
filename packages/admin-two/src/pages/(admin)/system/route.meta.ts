import type { RouteMetaInput } from '@office-admin/lib/router';

/** 纯分组目录：没有 page.tsx，只作为菜单父级 */
export default {
  title: '系统管理',
  icon: 'setting',
  order: 80,
} satisfies RouteMetaInput;
