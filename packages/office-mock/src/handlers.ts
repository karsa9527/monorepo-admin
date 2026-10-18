import type { MockRoute } from './types.js';
import { ACCOUNTS, ROLE_LIST, USER_LIST, type MockUser } from './db.js';

const ok = <T>(data: T) => ({ code: 0, data, message: 'success' });
const fail = (message: string, code = 500) => ({ code, data: null, message });

/** 简单分页 */
function paginate<T>(list: T[], page = 1, pageSize = 10) {
  const start = (page - 1) * pageSize;
  return {
    list: list.slice(start, start + pageSize),
    total: list.length,
    page,
    pageSize,
  };
}

export const mockRoutes: MockRoute[] = [
  // ---------- 认证 ----------
  {
    method: 'POST',
    url: '/api/auth/login',
    delay: 400,
    handler: (req) => {
      const { username, password } = req.body as { username?: string; password?: string };
      const account = username ? ACCOUNTS[username] : undefined;
      if (!account || account.password !== password) {
        return fail('用户名或密码错误', 401);
      }
      return ok({
        token: `mock-token-${account.user.username}-${Date.now()}`,
        refreshToken: `mock-refresh-${account.user.username}`,
        expiresIn: 7200,
      });
    },
  },
  {
    method: 'POST',
    url: '/api/auth/logout',
    handler: () => ok(true),
  },

  // ---------- 用户 ----------
  {
    method: 'GET',
    url: '/api/user/info',
    delay: 300,
    handler: (req) => {
      // 从 Authorization 解析 token 中携带的用户名
      const auth = req.headers.authorization || req.headers.Authorization || '';
      const match = /mock-token-([a-zA-Z0-9_]+)-/.exec(auth);
      const username = match?.[1] ?? 'admin';
      const account = ACCOUNTS[username];
      if (!account) return fail('登录状态已失效，请重新登录', 401);
      return ok(account.user);
    },
  },
  {
    method: 'GET',
    url: '/api/system/users',
    delay: 350,
    handler: (req) => {
      const { page = '1', pageSize = '10', keyword = '', status = '' } = req.query;
      let list: MockUser[] = USER_LIST;
      if (keyword) {
        list = list.filter((u) => u.username.includes(keyword) || u.nickname.includes(keyword));
      }
      if (status !== '') {
        list = list.filter((u) => String(u.status) === status);
      }
      return ok(paginate(list, Number(page), Number(pageSize)));
    },
  },
  {
    method: 'POST',
    url: '/api/system/users',
    handler: (req) => ok({ id: Date.now(), ...(req.body as object) }),
  },
  {
    method: 'DELETE',
    url: '/api/system/users/:id',
    handler: () => ok(true),
  },

  // ---------- 角色 ----------
  {
    method: 'GET',
    url: '/api/system/roles',
    delay: 300,
    handler: () => ok(ROLE_LIST),
  },
  {
    method: 'PUT',
    url: '/api/system/roles/:id',
    handler: (req) => ok({ id: Number(req.query.id), ...(req.body as object) }),
  },

  // ---------- 菜单 ----------
  {
    method: 'GET',
    url: '/api/system/menus',
    delay: 250,
    handler: () => ok([]), // 演示：菜单由前端路由表 + 权限点过滤生成
  },

  // ---------- 仪表盘 ----------
  {
    method: 'GET',
    url: '/api/dashboard/stats',
    delay: 400,
    handler: () =>
      ok({
        cards: [
          { key: 'visits', title: '今日访问', value: 12894, unit: '次', trend: 12.4 },
          { key: 'orders', title: '今日订单', value: 3561, unit: '单', trend: 8.1 },
          { key: 'gmv', title: '成交额', value: 892431.5, unit: '元', trend: -3.2 },
          { key: 'users', title: '新增用户', value: 731, unit: '人', trend: 5.6 },
        ],
        week: [
          { day: '周一', visits: 1200, orders: 320 },
          { day: '周二', visits: 1400, orders: 380 },
          { day: '周三', visits: 1100, orders: 290 },
          { day: '周四', visits: 1700, orders: 460 },
          { day: '周五', visits: 2100, orders: 590 },
          { day: '周六', visits: 2600, orders: 720 },
          { day: '周日', visits: 2300, orders: 640 },
        ],
        todos: [
          { id: 1, text: '审核 12 条用户实名申请', level: 'high' },
          { id: 2, text: '导出上月运营报表', level: 'normal' },
          { id: 3, text: '排查订单同步延迟告警', level: 'high' },
          { id: 4, text: '更新角色权限配置', level: 'low' },
        ],
      }),
  },
];
