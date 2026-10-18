import type { RouteMetaInput } from '@office/lib/router';

/**
 * 后台主区域（路由组，不进入 URL）
 * 根路径重定向到仪表盘
 */
export default {
  redirect: '/dashboard',
} satisfies RouteMetaInput;
