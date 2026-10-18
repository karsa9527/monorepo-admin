import { http } from '@office/lib/request';
import type { RoleItem } from '@/types';

/** 角色管理接口 */
export const roleService = {
  getRoles() {
    return http.get<RoleItem[]>('/system/roles');
  },

  updateRole(id: number, data: Partial<RoleItem>) {
    return http.put<RoleItem>(`/system/roles/${id}`, data, {
      showSuccess: true,
      successMessage: '保存成功',
    });
  },
};
