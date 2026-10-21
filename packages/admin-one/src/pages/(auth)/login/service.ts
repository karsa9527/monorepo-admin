import { http } from '@office-admin/lib/request';
import type { LoginParams, LoginResult, UserInfo } from '@/types';

/** 认证接口：登录页触发登录，AuthStore 负责恢复会话与退出 */
export const authService = {
  login(data: LoginParams) {
    return http.post<LoginResult>('/auth/login', data, {
      withToken: false,
      showSuccess: true,
      successMessage: '登录成功',
    });
  },

  logout() {
    return http.post<boolean>('/auth/logout', null, { showError: false });
  },

  /** 获取当前登录用户信息（含角色与权限点） */
  getUserInfo() {
    return http.get<UserInfo>('/user/info', undefined, { showError: false });
  },
};
