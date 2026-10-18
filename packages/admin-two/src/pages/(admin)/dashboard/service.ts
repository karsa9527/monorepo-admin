import { http } from '@office/lib/request';
import type { DashboardStats } from '@/types';

/** 仪表盘接口 */
export const dashboardService = {
  getStats() {
    return http.get<DashboardStats>('/dashboard/stats', undefined, { showError: false });
  },
};
