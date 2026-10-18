# admin-one · 后台管理系统 A（Monorepo 子工程）

> **迁移说明（自 admin-react 迁入）**
>
> 本工程已并入 `monorepo-admin` 单仓，目录为 `packages/admin-one`。
> 原工程里的公共代码已抽到共享包，本文档中出现的旧路径请对照替换：
>
> | 旧位置                                                          | 现在的位置                                      | 导入方式                          |
> | --------------------------------------------------------------- | ----------------------------------------------- | --------------------------------- |
> | `src/utils/*`                                                   | `packages/office-lib/src/*`                     | `@office/lib`                     |
> | `src/utils/request/*`                                           | `packages/office-lib/src/request/*`             | `@office/lib/request`             |
> | `src/utils/hooks/*`                                             | `packages/office-lib/src/hooks/*`               | `@office/lib/hooks`               |
> | `src/router/{fs-routes,helpers,types,lazy-page,icons,redirect}` | `packages/office-lib/src/router/*`              | `@office/lib/router`              |
> | `src/components/page-loading/*`                                 | `packages/office-components/src/loading/*`      | `@office/components/loading`      |
> | `src/components/layouts/basic-layout/*`                         | `packages/office-components/src/basic-layout/*` | `@office/components/basic-layout` |
> | `src/components/layouts/header-bar/*`                           | `packages/office-components/src/header-bar/*`   | `@office/components/header-bar`   |
> | `src/components/layouts/side-menu/*`                            | `packages/office-components/src/side-menu/*`    | `@office/components/side-menu`    |
> | `src/components/layouts/breadcrumbs/*`                          | `packages/office-components/src/breadcrumbs/*`  | `@office/components/breadcrumbs`  |
> | （新增）应用侧容器                                              | `src/components/app-shell/*`                    | 由 `(admin)/layout.tsx` 引用      |
> | `src/pages/(auth)/403/*` 的页面 UI                              | `packages/office-components/src/forbidden/*`    | `@office/components/forbidden`    |
> | `src/pages/(auth)/404/*` + `src/pages/not-found.tsx` 的页面 UI  | `packages/office-components/src/not-found/*`    | `@office/components/not-found`    |
> | `mock/*`                                                        | `packages/office-mock/src/*`                    | `@office/mock`                    |
>
> 应用内保留的是「业务相关」部分：`src/pages`（约定式路由的页面目录）、`src/stores`、
> `src/components/app-shell`（布局容器）、`src/theme`、`src/styles` 以及依赖 store 的 `src/router/auth-guard`。
> `pages/(auth)/403|404/page.tsx` 与根 `not-found.tsx` 现在只剩一行 `export { default } from '@office/components/...`，
> 路由元信息仍留在各自的 `route.meta.ts`。
>
> **命令请在仓库根目录执行**：`npm install` / `npm run dev:one` / `npm run build:one`。
> 在子工程目录里执行时，`predev` 会先构建 `@office/mock`。

TypeScript + React 18 + MobX 6 + Vite 5 + Ant Design 5 + Sass，内置**请求库**、**基础工具库**、**三层权限体系**与**明暗主题**，开箱即用。

## 快速开始

```bash
# 在仓库根目录
npm install            # 安装全部 workspace 依赖（postinstall 会构建 @office/mock）
npm run dev:one        # http://localhost:5178
npm run build:one      # tsc --noEmit && vite build
npm run typecheck
npm run lint
npm run format

# 只操作本包
npm run dev -w @office/admin-one
```

演示账号（数据来自本地 mock，无需后端）：

| 账号       | 密码     | 权限                               |
| ---------- | -------- | ---------------------------------- |
| `admin`    | `123456` | 全部权限（超级管理员）             |
| `operator` | `123456` | 只读：仪表盘 + 用户列表 + 角色列表 |

## 目录结构

```
admin-react
├── mock/                          # 本地 mock（Vite 中间件拦截 /api，仅 dev 生效）
│   ├── mock-plugin.ts             #   支持 :id 路径参数、delay、query/body 解析
│   ├── handlers.ts                #   接口清单
│   └── db.ts                      #   用户/角色/权限点数据源
├── src
│   ├── utils/                     # 基础设施（原 shared）
│   │   ├── request/               #   ① 请求库（axios 封装）
│   │   │   ├── request.ts         #     Request 类
│   │   │   ├── error.ts           #     RequestError
│   │   │   ├── types.ts           #     类型
│   │   │   └── index.ts           #     默认实例 http + 钩子
│   │   ├── hooks/                 #   use-request.ts（useRequest）
│   │   └── *.ts                   #   ② 基础工具库（storage/format/date/tree…）
│   ├── types/                     # 领域模型（UserInfo / RoleItem / DashboardStats…）
│   ├── stores/                    # MobX：RootStore / AuthStore / PermissionStore / AppStore
│   ├── router/                    # 约定式路由：fs-routes / lazy-page / auth-guard / redirect
│   ├── components/                # 组件：一个组件一个文件夹，入口统一 index.tsx
│   │   ├── auth/                  #   权限组件 <Auth> + usePermission
│   │   └── app-shell/             #   布局容器：把 store 状态注入 @office/components 的布局组件
│   ├── pages/                     # 目录即路由（page.tsx / layout.tsx / route.meta.ts / service.ts）
│   ├── styles/                    # Sass：_config 常量、_mixins、_theme CSS 变量、global
│   ├── theme/                     # 主题：tokens + antd-theme（antd 全局配置）+ apply-theme
│   └── constants/                 # 权限点字典等常量
```

### 命名与目录约定

| 约定                         | 说明                                                                 |
| ---------------------------- | -------------------------------------------------------------------- |
| 文件名全部小写               | 多单词用 kebab-case：`basic-layout`、`use-request`、`antd-theme`     |
| 组件 = 文件夹 + `index.tsx`  | 例：`components/app-shell/index.tsx`，样式同名放 `index.module.scss` |
| 页面 = 页面目录 + `page.tsx` | 配套 `route.meta.ts`、`service.ts`、`index.module.scss`              |
| 接口跟着页面走               | 不再有 `src/services/`：谁用接口谁建 `service.ts`，导出 `xxxService` |
| 领域模型集中在 `src/types`   | `UserInfo` / `RoleItem` / `DashboardStats` 等跨页面复用的类型        |

`service.ts` 就近放置的例子：

```
pages/(auth)/login/service.ts              → authService（login / logout / getUserInfo）
pages/(admin)/dashboard/service.ts         → dashboardService
pages/(admin)/system/user/service.ts       → userService
pages/(admin)/system/role/service.ts       → roleService
```

> `AuthStore` 会引用 `login/service.ts`（登录、恢复会话、登出都在 store 里编排），其余页面只引用同目录的 `service.ts`。

---

## ① 请求库 `src/utils/request`

基于 axios 的 `Request` 类，`http` 为全局默认实例，`createRequest()` 可创建独立实例（对接第三方接口）。

```ts
import { http, RequestError } from '@/utils/request';

// 默认返回业务 data（后端约定 { code, data, message }）
const user = await http.get<UserInfo>('/user/info');

// raw=true 返回完整响应体，自行处理 code
const res = await http.get('/user/info', undefined, { raw: true });

await http.post('/system/users', data, { showSuccess: true, successMessage: '创建成功' });
```

**能力清单**

| 能力         | 说明                                                                                    |
| ------------ | --------------------------------------------------------------------------------------- |
| 统一配置     | baseURL / timeout / Content-Type，从 `.env` 读取                                        |
| token 注入   | 请求拦截器自动带 `Authorization: Bearer xxx`，`withToken: false` 可关闭                 |
| 业务码拆包   | `code ∈ [0, 200]` 视为成功，默认直接返回 `data`                                         |
| 统一错误     | 全部异常包装为 `RequestError`（含 `code` / `response` / `isCancel` / `isUnauthorized`） |
| 401 处理     | 触发 `onUnauthorized` → 清理登录态 + 跳转登录页                                         |
| 重复请求取消 | 同 `method + url + 参数` 的请求自动 abort 上一个（`cancelDuplicate: false` 关闭）       |
| 自动重试     | `retry: 2` 对网络错误 / 超时 / 5xx 按 1x/2x/3x 退避重试                                 |
| 全局 loading | `onLoadingChange(pending)` 驱动顶部进度条                                               |
| 上传 / 下载  | `http.upload()` / `http.download()`，自动处理 FormData 与 Blob                          |
| 取消请求     | `http.cancelAll()`（路由切换时调用）、`http.cancel(url, method)`                        |

请求库**不依赖 UI**，通过钩子与 antd / 路由 / store 解耦，在 `src/app.tsx` 中一次性注入：

```ts
setupRequestHooks({
  getToken: () => auth.token,
  onError: (e) => message.error(e.message),
  onSuccess: (t) => message.success(t),
  onLoadingChange: (n) => app.setRequestPending(n),
  onUnauthorized: () => {
    auth.logout(true);
    router.navigate('/login');
  },
});
```

## ② 基础工具库 `src/utils`

统一从 `@/utils` 导入。

| 模块       | 主要内容                                                                                                                 |
| ---------- | ------------------------------------------------------------------------------------------------------------------------ |
| `is`       | `isDef/isEmpty/isObject/isPromise/isExternal/isUrl/isMobile` …                                                           |
| `storage`  | `storage` / `sessionStorage$` 类，支持命名空间、TTL 过期、JSON 序列化；`tokenStorage` 独立分区                           |
| `format`   | `formatNumber/formatMoney/formatCompactMoney/formatPercent/formatFileSize`、手机号/身份证/邮箱脱敏、驼峰短横线互转、uuid |
| `date`     | 基于 dayjs：`formatDate`、`fromNow`（3 分钟前）、`getRange`、`formatDuration`                                            |
| `object`   | `deepClone/deepMerge/omitEmpty/omit/pick/get`、数组 `unique/groupBy/toMap/chunk/sum/sortBy`                              |
| `tree`     | `listToTree/treeToList/findTreeNode/filterTree/getTreePath/mapTree`（菜单、部门通用）                                    |
| `function` | `debounce/throttle`（带 cancel/flush）、`sleep/retry/once/sequential`、`safeJsonParse`、`to()`                           |
| `validate` | 手机号、邮箱、身份证、强密码、URL、IPv4、车牌等正则与 `passwordStrength`                                                 |
| `url`      | `stringifyQuery/parseQuery/joinUrl/appendQuery/parseHash`                                                                |
| `download` | `downloadBlob/downloadByUrl/exportJson/exportCsv`（CSV 带 BOM，Excel 不乱码）                                            |
| `dom`      | `copyText/toggleFullscreen/scrollToTop/onResize/setDocumentTitle`                                                        |
| `env`      | 类型化环境变量与 `isDev/isProd/isBrowser`                                                                                |

## ③ 权限体系

三层模型，权限点由后端 `/user/info` 下发：

**1）接口级** — 请求库自动带 token，401 统一登出跳转。

**2）路由级** — 页面目录旁的 `route.meta.ts` 声明权限：

```ts
// src/pages/(admin)/system/user/route.meta.ts
import type { RouteMetaInput } from '@/router/types';

export default {
  title: '用户管理',
  icon: 'team',
  permission: 'system:user:list',
  order: 1,
} satisfies RouteMetaInput;
```

- `PermissionStore.accessibleRoutes` 按权限过滤路由树 → 侧边菜单自动只显示有权限的项
- `router/auth-guard` 守卫：未登录跳 `/login`（带来源地址），已登录无权限跳 `/403`
- 直接输入越权 URL 会被拦截（可用 operator 账号访问 `/system/menu` 验证）

**3）按钮级** — `<Auth>` 组件 / `usePermission()` hook / `withAuth` HOC：

```tsx
<Auth code="system:user:create">
  <Button type="primary">新增用户</Button>
</Auth>

<Auth code={['system:user:update', 'system:user:delete']} mode="all" fallback={<span>—</span>}>
  ...
</Auth>

const { has, hasAny, hasAll } = usePermission();
```

角色 `admin` 或权限点含 `*` 视为超级管理员，直接放行。

## MobX 状态管理

```tsx
const { auth, permission, app } = useStores(); // 或 useAuthStore() / useAppStore()

// 组件用 observer 包裹以响应状态变化
const HeaderBar = observer(() => {
  const app = useAppStore();
  return <span onClick={app.toggleCollapsed}>{app.collapsed ? '展开' : '收起'}</span>;
});
```

- `RootStore` 聚合子 store，子 store 通过 `root` 互访（如登录成功后写入权限）
- 全部使用 `makeAutoObservable`，无需装饰器
- `AuthStore.bootstrap()` 刷新时恢复登录态；失败自动清理，避免死循环跳登录

## 约定式（文件系统）路由

`src/pages` 的目录结构就是路由表，新增页面不用写任何注册代码，规则贴近 Next.js App Router。

```
src/pages
├── not-found.tsx                 # 全局 404（注册为 *）
├── (auth)                        # 路由组：不进 URL，只决定用哪套布局
│   ├── layout.tsx                #   独立页布局（无侧边栏）
│   ├── login/                    #   -> /login
│   │   ├── page.tsx
│   │   └── route.meta.ts
│   ├── 403/page.tsx              #   -> /403
│   └── 404/page.tsx              #   -> /404
└── (admin)                       # 后台主区域，共享 BasicLayout
    ├── layout.tsx                #   re-export @/components/app-shell
    ├── route.meta.ts             #   { redirect: '/dashboard' }：根路径重定向
    ├── dashboard/page.tsx        #   -> /dashboard
    ├── profile/page.tsx          #   -> /profile
    └── system/                   #   纯分组目录（没有 page.tsx）
        ├── route.meta.ts         #     菜单父级「系统管理」
        ├── user/page.tsx         #   -> /system/user
        ├── role/page.tsx         #   -> /system/role
        └── menu/page.tsx         #   -> /system/menu
```

**约定文件**

| 文件            | 作用                                                                                                                                  |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `page.tsx`      | 页面组件（默认导出），该目录的路由内容                                                                                                |
| `layout.tsx`    | 该段的布局，包住子路由（代替默认 `<Outlet />`）                                                                                       |
| `route.meta.ts` | 该段元信息：`title / icon / permission / roles / order / hideInMenu / hideChildrenInMenu / ignoreAuth / keepAlive / affix / redirect` |
| `loading.tsx`   | 该段的 Suspense fallback（同步引入，不要用懒加载组件）                                                                                |
| `not-found.tsx` | 该段未匹配子路径时的兜底页                                                                                                            |

**路径规则**

| 写法                   | 结果                                       |
| ---------------------- | ------------------------------------------ |
| `system/user/page.tsx` | `/system/user`                             |
| `[id]/page.tsx`        | `:id` 动态段，页面里用 `useParams().id` 取 |
| `[...slug]/page.tsx`   | `*` 通配段                                 |
| `(admin)/…`            | 路由组，不进入 URL                         |
| `_components/…`        | `_` 开头的目录/文件不参与路由              |

**route.meta.ts 的三个要点**

```ts
// src/pages/(admin)/system/user/route.meta.ts
import type { RouteMetaInput } from '@/router/types';

export default {
  title: '用户管理',
  icon: 'team', // 图标名，可用值见 src/router/icons.tsx 的 iconMap
  permission: 'system:user:list',
  order: 1,
} satisfies RouteMetaInput;
```

1. **图标写字符串而不是组件**：`route.meta.ts` 会被 eager 扫描进主包，写组件会把 antd 图标拖进首屏，菜单也无法在页面代码下载前渲染出来
2. **目录没有 `page.tsx` 但有 `route.meta.ts`** → 作为菜单分组（如 `system`），不产生页面
3. **漏写 `route.meta.ts` 的页面**会被兜底成「需登录 + 不进菜单」，不会因为忘记配置而变成公开页

**新增一个页面**

```bash
mkdir -p 'src/pages/(admin)/order/list'
```

放入 `page.tsx` 与 `route.meta.ts`，路由和菜单自动出现（dev server 会因 glob 变化自动刷新）。需要嵌套布局就再加 `layout.tsx`。

`VITE_ROUTER_MODE` 仍可切换 `hash` / `browser` 路由。

### 路由级代码分割

页面与布局由生成器统一用 `lazyPage()` 包装，**每个路由对应独立 chunk**，首屏只下载当前路由的代码，不需要手动注册。

生成逻辑在 `src/router/fs-routes.tsx`：`import.meta.glob` 扫描五类约定文件 → 构建目录树 → 递归产出 `AppRouteObject[]`；`router/index.tsx` 再把它转成 react-router 的 `RouteObject` 并套上 `AuthGuard`。

`src/router/lazy-page.ts` 在 `React.lazy` 之上补了**发版兜底**：旧 chunk 404 导致白屏时自动整页刷新一次（5 分钟窗口内不重复），避免用户卡在报错页。

**Suspense 边界分两层**：

| 位置                           | 覆盖范围                                                        |
| ------------------------------ | --------------------------------------------------------------- |
| `router/index.tsx`（顶层节点） | `(admin)` / `(auth)` 的懒加载布局，以及 `*` 兜底页              |
| `BasicLayout` 内容区           | 布局内所有子路由，切页时只有内容区显示 loading，侧边栏/顶栏不闪 |

生成器会给带 `layout.tsx` 的节点自动标记 `suspense: true`，并在外层套 `Suspense`（fallback 用该目录的 `loading.tsx`，没有则用宿主注入的 `Loading`）；布局内部的页面挂起由布局内部更近的边界接管。

**关键：导航必须走过渡（transition）**

`React.lazy` 组件在**同步渲染**中挂起会抛
`A component suspended while responding to synchronous input`，
而路由守卫里的 `<Navigate>`、菜单 `onClick` 里的 `navigate()` 恰好都发生在离散事件的同步渲染里。本项目三处兜底：

1. `src/app.tsx` 给 `<RouterProvider future={{ v7_startTransition: true }} />`，路由状态更新整体走 `startTransition`
2. `src/router/redirect/index.tsx`：守卫 / 登录页的跳转改为 `useEffect` + `startTransition`（不要再用 `<Navigate>` 指向懒加载页面）
3. 菜单点击、下拉菜单跳转都用 `startTransition(() => navigate(...))` 包裹

> 新增跳转逻辑时请复用 `<Redirect>` 或 `startTransition`，否则会在控制台看到上面的 suspended 报错。

## 主题与样式

样式方案：**Sass（SCSS Modules）+ CSS 变量**，antd 的样式通过 `ConfigProvider` 的 `theme` 统一配置。

| 文件                       | 职责                                                                                                     |
| -------------------------- | -------------------------------------------------------------------------------------------------------- |
| `src/styles/_config.scss`  | 编译期常量：间距、圆角、断点、字体、布局尺寸（不产出 CSS）                                               |
| `src/styles/_mixins.scss`  | 通用 mixin：`flex-center` / `ellipsis` / `card` / `hoverable` / `scrollbar` / `media-down` / `dark-only` |
| `src/styles/_theme.scss`   | 运行时主题变量：`:root` 浅色、`html[data-theme='dark']` 深色                                             |
| `src/styles/global.scss`   | 全局 reset、滚动条、`.page-card`                                                                         |
| `src/theme/tokens.ts`      | 设计令牌（给 antd 用），与 `_theme.scss` 的数值一一对应                                                  |
| `src/theme/antd-theme.ts`  | antd 全局样式：algorithm + token + components                                                            |
| `src/theme/apply-theme.ts` | 把主题写到 `<html data-theme>` / `color-scheme` / `theme-color`                                          |

`_config.scss` 与 `_mixins.scss` 由 `vite.config.ts` 的 `additionalData` 自动注入，业务 `.scss` 可直接使用 `$space-4`、`@include ellipsis;`，不必写 `@use`（这两个文件本身不产出 CSS，因此不会重复打包）。

### 明暗切换

切换只改一个属性，CSS 与 antd 各自响应：

```ts
const app = useAppStore();
app.toggleTheme(); // light <-> dark
app.setPrimaryColor('#00b96b'); // 品牌色，同时更新 antd token 与 CSS 变量
```

- **自定义样式**：全部走 `var(--app-*)`；`html[data-theme='dark']` 下整套变量被替换，纯 CSS 生效，不需要 JS 参与重绘
- **antd 组件**：`createAntdTheme()` 按 `mode` 切 `darkAlgorithm`，并开启 `cssVar`，切主题只替换 `--ant-*` 变量值
- **首屏无闪烁**：`index.html` 里的内联脚本在 React 挂载前就按「本地记录 > 系统偏好」写好 `data-theme`，`AppStore` 构造函数再同步一次，两边规则一致
- 选择存到 `admin:theme-mode`，`color-scheme` 一起切（原生滚动条、输入框、日期面板都会跟着变）

品牌色是运行时注入的 `--app-color-primary`，`_theme.scss` 里的渐变用 `color-mix()` 从它派生，所以改主色不需要重新编译 SCSS。

### 全局改 antd 样式的入口

只改 `src/theme/antd-theme.ts` 一个文件：

```ts
{
  // algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm, // 1. 派生色
  // token: { colorPrimary, borderRadius, fontFamily, ... },           // 2. 全局 token
  // components: { Layout: {...}, Menu: {...}, Table: {...} },         // 3. 组件级覆写
}
```

> 开启 `cssVar` 后 antd 变量挂在 `ConfigProvider` 的容器 class（`.css-var-*`）上，`html` / `body` 取不到，只在该容器内部有效。

新增页面样式：在页面目录下建 `index.module.scss`，直接用注入的变量与 mixin：

```scss
.card {
  @include card;

  &:hover {
    background: var(--app-color-bg-hover);
  }
}
```

## 代码规范（ESLint + Prettier + lint-staged）

| 文件                    | 作用                                                                         |
| ----------------------- | ---------------------------------------------------------------------------- |
| `.eslintrc.json`        | ESLint 8 配置：TS / React / Hooks 规则，`extends` 末尾接 `prettier` 关闭冲突 |
| `prettier.config.js`    | 格式化规则：单引号、分号、`printWidth: 100`、`trailingComma: all`、LF        |
| `lint-staged.config.js` | 只处理暂存区文件：`eslint --fix` → `prettier --write`                        |
| `.prettierignore`       | 排除 `dist`、`node_modules`、`package-lock.json` 等产物                      |
| `.husky/pre-commit`     | 提交前执行 `npx lint-staged`，lint 报错直接阻断提交                          |

约定与取舍：

- **类型检查不进 pre-commit**（`tsc --noEmit` 是全量、较慢），交给 `npm run build` / CI；
  需要强校验时把 `lint-staged.config.js` 中的条目改成 `'*.{ts,tsx}': () => 'tsc --noEmit'`
- `react-refresh/only-export-components`、`react/jsx-no-useless-fragment` 关闭：
  前者对本项目「组件与 hook 同文件导出」及 `export *` 误报；后者的 `<>{children}</>` 是把
  `ReactNode` 归一成 `JSX.Element` 的必要写法
- 规则分级：`error` 用于真问题（未使用变量、Hooks 依赖之外的错误用法），`warn` 用于可自动
  修复的风格项（`consistent-type-imports`、`no-explicit-any`）
- **ESLint 锁在 8.x**：`.eslintrc.json` 是 ESLint 8 的配置格式；升级 ESLint 9 时需改用
  `eslint.config.js` 扁平配置，并把 `plugin:@typescript-eslint/recommended` 换成
  `typescript-eslint` 的 `configs.recommended`
- 新增文件后跑一次 `npm run lint:fix && npm run format`，避免提交时被钩子改出一堆 diff
- `.husky/pre-commit` 会按需加载 nvm / volta / fnm 或常见安装目录：GUI 客户端（VS Code
  源代码管理、Sourcetree 等）不读 shell 配置，PATH 里没有 node 时也能正常跑 lint-staged

## 环境变量

见 `.env.development` / `.env.production`：`VITE_API_BASE_URL`、`VITE_REQUEST_TIMEOUT`、`VITE_APP_TITLE`、`VITE_USE_MOCK`、`VITE_ROUTER_MODE`。

## 接入真实后端

1. 删除 `vite.config.ts` 中的 `mockPlugin()`（`mock/mock-plugin.ts`）（或设置 `VITE_USE_MOCK=false`）
2. 配置 `server.proxy.target` 指向后端地址
3. 按「接口跟着页面走」补 `service.ts`，响应体保持 `{ code, data, message }`：

```ts
// src/pages/(admin)/system/user/service.ts
import { http } from '@/utils/request';
import type { PageParams, PageResult, UserInfo } from '@/types';

export const userService = {
  getUsers(params: PageParams = {}) {
    return http.get<PageResult<UserInfo>>('/system/users', params);
  },
};
```

```ts
// 页面里只认同目录的 service
import { userService } from './service';
```
