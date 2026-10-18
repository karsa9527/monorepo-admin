/** 领域模型（跨页面/跨 store 复用的数据结构） */

export interface LoginParams {
  username: string;
  password: string;
  /** 记住我 */
  remember?: boolean;
}

export interface LoginResult {
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface UserInfo {
  id: number;
  username: string;
  nickname: string;
  avatar: string;
  email: string;
  phone: string;
  status: 0 | 1;
  roles: string[];
  permissions: string[];
  createdAt: string;
}

export interface PageParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: string | number;
}

export interface PageResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface RoleItem {
  id: number;
  name: string;
  code: string;
  description: string;
  permissions: string[];
  userCount: number;
  createdAt: string;
}

export interface DashboardStats {
  cards: Array<{
    key: string;
    title: string;
    value: number;
    unit: string;
    trend: number;
  }>;
  week: Array<{ day: string; visits: number; orders: number }>;
  todos: Array<{ id: number; text: string; level: 'high' | 'normal' | 'low' }>;
}
