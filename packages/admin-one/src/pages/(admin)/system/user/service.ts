import { http } from '@office-admin/lib/request';
import type { PageParams, PageResult, UserInfo } from '@/types';

/** 用户管理接口 */
export const userService = {
  /** 用户分页列表 */
  getUsers(params: PageParams = {}) {
    return http.get<PageResult<UserInfo>>('/system/users', params);
  },

  createUser(data: Partial<UserInfo>) {
    return http.post<UserInfo>('/system/users', data, {
      showSuccess: true,
      successMessage: '创建成功',
    });
  },

  deleteUser(id: number) {
    return http.delete<boolean>(`/system/users/${id}`, undefined, {
      showSuccess: true,
      successMessage: '删除成功',
    });
  },
};
