/** mock 数据源：用户、角色、权限、菜单 */

export interface MockUser {
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

/** 权限点字典：后端下发的标识，前端据此做菜单/按钮级控制 */
export const PERMISSIONS = {
  DASHBOARD_VIEW: 'dashboard:view',
  USER_LIST: 'system:user:list',
  USER_CREATE: 'system:user:create',
  USER_UPDATE: 'system:user:update',
  USER_DELETE: 'system:user:delete',
  USER_EXPORT: 'system:user:export',
  ROLE_LIST: 'system:role:list',
  ROLE_UPDATE: 'system:role:update',
  MENU_LIST: 'system:menu:list',
  LOG_LIST: 'system:log:list',
} as const;

/** 超级管理员：拥有全部权限 */
const ADMIN_PERMISSIONS = Object.values(PERMISSIONS) as string[];

/** 普通运营：只读，不含删除/导出 */
const OPERATOR_PERMISSIONS = [
  PERMISSIONS.DASHBOARD_VIEW,
  PERMISSIONS.USER_LIST,
  PERMISSIONS.ROLE_LIST,
];

export const ACCOUNTS: Record<string, { password: string; user: MockUser }> = {
  admin: {
    password: '123456',
    user: {
      id: 1,
      username: 'admin',
      nickname: '超级管理员',
      avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=admin',
      email: 'admin@demo.com',
      phone: '13800000001',
      status: 1,
      roles: ['admin'],
      permissions: ADMIN_PERMISSIONS,
      createdAt: '2024-01-01 09:00:00',
    },
  },
  operator: {
    password: '123456',
    user: {
      id: 2,
      username: 'operator',
      nickname: '运营小张',
      avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=operator',
      email: 'operator@demo.com',
      phone: '13800000002',
      status: 1,
      roles: ['operator'],
      permissions: OPERATOR_PERMISSIONS,
      createdAt: '2024-03-12 10:30:00',
    },
  },
};

/** 用户列表（系统管理 - 用户管理） */
export const USER_LIST: MockUser[] = Array.from({ length: 46 }).map((_, i) => ({
  id: 100 + i,
  username: `user_${String(i + 1).padStart(3, '0')}`,
  nickname: ['陈曦', '林墨', '苏晚', '周野', '许清', '沈砚'][i % 6],
  avatar: `https://api.dicebear.com/7.x/miniavs/svg?seed=${i}`,
  email: `user${i + 1}@demo.com`,
  phone: `137${String(10000000 + i).slice(0, 8)}`,
  status: i % 7 === 0 ? 0 : 1,
  roles: i % 3 === 0 ? ['admin'] : i % 3 === 1 ? ['operator'] : ['viewer'],
  permissions: [],
  createdAt: `2024-0${(i % 9) + 1}-${String((i % 28) + 1).padStart(2, '0')} 12:00:00`,
}));

export interface MockRole {
  id: number;
  name: string;
  code: string;
  description: string;
  permissions: string[];
  userCount: number;
  createdAt: string;
}

export const ROLE_LIST: MockRole[] = [
  {
    id: 1,
    name: '超级管理员',
    code: 'admin',
    description: '系统全部权限，可管理用户、角色与菜单',
    permissions: ADMIN_PERMISSIONS,
    userCount: 2,
    createdAt: '2024-01-01 09:00:00',
  },
  {
    id: 2,
    name: '运营',
    code: 'operator',
    description: '可查看仪表盘与用户列表，无写权限',
    permissions: OPERATOR_PERMISSIONS,
    userCount: 12,
    createdAt: '2024-02-11 14:20:00',
  },
  {
    id: 3,
    name: '访客',
    code: 'viewer',
    description: '仅可查看仪表盘',
    permissions: [PERMISSIONS.DASHBOARD_VIEW],
    userCount: 34,
    createdAt: '2024-05-06 11:05:00',
  },
];
