# monorepo-admin · 前端单仓工程

> **仓库位置**：`WorkSpace/monorepo-admin/`
>
> 单仓被收进独立目录，与 `WorkSpace` 下的其它工程（`admin-vue`、`vite-demo` 等历史项目）互不干扰：
> 各自的 `node_modules` / 锁文件 / ESLint & Prettier 配置完全隔离，互不继承、互不覆盖。
> **所有命令都在本目录内执行**，不要回到 `WorkSpace` 根目录跑 `npm install`。

基于 **npm workspaces** 的 Monorepo：一套共享包（工具库 / 组件库 / Mock）+ 多套后台应用。

- 构建：Vite 5 + TypeScript 5.6（共享包以「源码」方式消费，改完即热更新，无需先构建）
- 应用栈：React 18 + MobX 6 + antd 5 + react-router-dom 6
- 规范：ESLint 8（两级继承）+ Prettier 3 + lint-staged + husky

## 目录结构

```
monorepo-admin/               # ← 本仓库根（npm install 在这里执行）
├── package.json              # workspaces 根：统一脚本、公共 devDependencies
├── tsconfig.base.json        # 所有子工程共享的 TS 编译选项
├── eslint.config.base.json   # ESLint 公共规则（子工程 .eslintrc.json 继承它）
├── .eslintrc.json            # 根目录自身生效的 ESLint 入口
├── prettier.config.js        # 格式化规则（唯一事实来源）
├── lint-staged.config.js     # 提交前只处理暂存区文件
├── .husky/pre-commit         # 调用 lint-staged（含 node 路径兜底）
└── packages/
    ├── office-admin-lib/         # @office-admin/lib         工具函数 + 请求层 + 约定式路由核心
    ├── office-admin-components/  # @office-admin/components  通用组件 + 后台布局（按子路径引入）
    ├── office-admin-mock/        # @office-admin/mock        mock 数据 + vite 中间件插件
    ├── admin-one/                # @office/admin-one         后台应用 A（端口 5178）
    └── admin-two/                # @office/admin-two         后台应用 B（端口 5179）
```

每个子工程都是「自包含」的：`package.json` + `tsconfig.json` + `.eslintrc.json` + `prettier.config.js` + `lint-staged.config.js`，
任意一个包单独 `npm install && npm run lint` 也能跑通；在根目录执行时则由 workspaces 统一驱动。

## 快速开始

```bash
npm install            # 安装全部 workspace 依赖（postinstall 会自动构建 @office-admin/mock）

npm run dev:one        # 启动 admin-one  → http://localhost:5178
npm run dev:two        # 启动 admin-two  → http://localhost:5179

npm run build          # 依次构建两个应用（各自先 tsc --noEmit）
npm run typecheck      # 所有子工程类型检查
npm run lint           # 根目录统一 lint（覆盖全部子工程）
npm run format         # 根目录统一格式化
```

单包操作：

```bash
npm run dev -w @office/admin-one
npm run build -w @office-admin/mock
npm run lint -w @office-admin/lib
```

## 共享包

### @office-admin/lib —— 基础库

| 入口                        | 内容                                                                                                                            |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `@office-admin/lib`         | is / storage / format / date / object / tree / function / validate / url / download / dom / env                                 |
| `@office-admin/lib/request` | axios 封装：token 注入、业务码拆包、重复请求取消、失败重试、401 登出                                                            |
| `@office-admin/lib/hooks`   | `useRequest`                                                                                                                    |
| `@office-admin/lib/router`  | 约定式（文件系统）路由：`createAppRouter` / `toRouteObjects` / `constantRoutes` / `lazyPage` / `Redirect` / 菜单与面包屑 helper |

路由核心与业务解耦：守卫、Loading、路由模式都由宿主注入。

```tsx
// packages/admin-one/src/router/index.tsx
createAppRouter({
  routes: constantRoutes, // 约定式扫描 src/pages 得到
  guard: AuthGuard, // 依赖登录态的路由守卫，应用自己实现
  fallback: <Loading tip="页面加载中…" />, // 应用自己的 Loading
  mode: env.ROUTER_MODE, // hash | browser
});
```

约定式路由的根目录固定为宿主应用的 `/src/pages`（`import.meta.glob` 的 pattern 必须是字面量），
目录约定 `page.tsx` / `layout.tsx` / `route.meta.ts` / `loading.tsx` / `not-found.tsx` 保持不变。

### @office-admin/components —— 组件库

`Loading` 是该包的第一个组件，支持四种用法：

```tsx
import Loading from '@office-admin/components/loading'; // 默认导入，组件没有具名导出

<Loading />                                   // 整屏，默认「加载中…」
<Loading tip="正在初始化…" />                  // 整屏 + 自定义文案
<Loading full={false} minHeight={200} />      // 局部占位
<Loading spinning={loading}>{content}</Loading> // 容器遮罩（antd 容器模式）
```

额外能力：`delay={200}` 延迟显示避免闪屏、`overlay` 覆盖父容器（局部刷新）、
`tip` 空字符串时只显示图标。样式自包含，颜色优先读取宿主的 `--app-*` CSS 变量。

**没有聚合出口（barrel）**：本包不提供 `src/index.ts`，也不提供 `@office-admin/components` 裸入口，
一律按组件子路径引入。好处是引入即精确命中文件——不会因为一次 `import { X } from '@office-admin/components'`
把整库拖进依赖图，也避免新增组件时反复改同一个「总出口」文件造成无谓冲突。

**组件只提供 `export default`**：`src/<component>/index.tsx` 里组件本体不具名导出，
使用方只能 `import X from '@office-admin/components/<component>'`。这样每个组件的对外契约是「一个默认导出」，
重命名 / 换实现不会牵动调用方，也不存在「默认导出与具名导出指向不同东西」的歧义。
（Props 类型仍可以 `export interface XxxProps` 形式导出——它只活在类型层，编译后不存在运行时导出。）

新增组件约定：建目录 `src/<component-name>/index.tsx`（组件用 `export default`）+ `index.module.scss`，
并在 `package.json` 的 `exports` 里补一条子路径（如 `"./loading"`），无需改任何其它文件。

#### 布局组件（basic-layout / header-bar / side-menu / breadcrumbs）

后台骨架也在本包里，四个组件**全部是受控的展示组件**：不认识 MobX / Redux，也不读任何 store，
折叠态、主题、菜单、面包屑、用户信息都通过 props 注入，应用侧只留一层薄容器（`src/components/app-shell`）。

| 入口                                    | 说明                                                                    |
| --------------------------------------- | ----------------------------------------------------------------------- |
| `@office-admin/components/basic-layout` | 侧栏 + 顶栏 + 内容区（+ 可选页脚）；不传 `children` 时渲染 `<Outlet />` |
| `@office-admin/components/header-bar`   | 折叠按钮 + 面包屑插槽 + 主题开关 + 用户下拉                             |
| `@office-admin/components/side-menu`    | 透传 antd `items`，选中态与父级展开自动跟随当前路由                     |
| `@office-admin/components/breadcrumbs`  | 纯渲染，链路数据由宿主算好传入                                          |

```tsx
import BasicLayout from '@office-admin/components/basic-layout';
import SideMenu from '@office-admin/components/side-menu';

<BasicLayout
  title="后台管理系统"
  logoMark="A"
  collapsed={app.collapsed} // 宿主状态
  theme={app.theme}
  loading={app.globalLoading}
  menu={<SideMenu items={menuItems} onNavigate={(key) => navigate(key)} />}
  header={<HeaderBar /* ... */ />}
/>;
```

好处是换掉 MobX 或加第三套应用时，布局一行都不用改。

#### 结果页组件（forbidden / not-found）

403 / 404 也在本包里，两个组件共用一个内部外壳（`src/result-page`，不对外暴露子路径），
只是 `status`、默认文案和默认标题不同。默认行为已经够用，应用侧只需在约定式路由文件里写一行导入：

```tsx
// admin-*/src/pages/(auth)/403/page.tsx
export { default } from '@office-admin/components/forbidden';

// admin-*/src/pages/(auth)/404/page.tsx  与  admin-*/src/pages/not-found.tsx
export { default } from '@office-admin/components/not-found';
```

需要定制时再传 props（两个组件签名一致）：`title` / `subTitle` / `backText`（传 `null` 则隐藏按钮）/
`backPath`（默认 `/`）/ `onBack`（完全接管返回逻辑）/ `extra`（替换整个操作区）/
`minHeight`（默认 `100vh`，嵌在布局内容区时可传数字或 `'100%'`）。

返回用 `navigate(backPath, { replace: true })`，`replace` 是为了不把 403/404 留在历史栈里，
避免用户点浏览器后退又回到错误页。组件属于路由级页面，需在 `HashRouter` / `BrowserRouter` 内部使用。

`src/pages/not-found.tsx`（约定式路由的全局兜底）与 `(auth)/404/page.tsx` 指向同一个模块，
构建后共享同一个 chunk——不要为兜底页再复制一份 UI。

### @office-admin/mock —— 开发期 Mock

`mockPlugin()` 是一个 Vite 中间件插件，只拦截 `/api` 前缀（可配置），未命中的请求继续走代理。

```ts
// vite.config.ts
import { mockPlugin } from '@office-admin/mock';
plugins: [react(), mockPlugin({ prefix: '/api' })];
```

- 数据源：`src/db.ts`（用户 / 角色 / 权限点）；接口：`src/handlers.ts`
- 该包以 **构建产物** 形式被 Node 侧消费（vite.config 会被打包，裸导入保持外部化），
  所以源码里的相对导入必须带 `.js` 后缀，改完 mock 需要 `npm run build -w @office-admin/mock`
  （应用的 `predev` / `prebuild` 已自动执行）

## 迁移对照表（原 admin-react → 新位置）

| 原路径                                              | 新位置                                                   | 引用方式                                 |
| --------------------------------------------------- | -------------------------------------------------------- | ---------------------------------------- |
| `src/utils/*`                                       | `packages/office-admin-lib/src/*`                        | `@office-admin/lib`                      |
| `src/utils/request/*`                               | `packages/office-admin-lib/src/request/*`                | `@office-admin/lib/request`              |
| `src/utils/hooks/*`                                 | `packages/office-admin-lib/src/hooks/*`                  | `@office-admin/lib/hooks`                |
| `src/router/fs-routes.tsx`                          | `packages/office-admin-lib/src/router/fs-routes.tsx`     | `@office-admin/lib/router`               |
| `src/router/{helpers,types,lazy-page,icons}.ts(x)`  | `packages/office-admin-lib/src/router/*`                 | `@office-admin/lib/router`               |
| `src/router/redirect/`                              | `packages/office-admin-lib/src/router/redirect.tsx`      | `@office-admin/lib/router`（`Redirect`） |
| `src/router/index.tsx`                              | `packages/office-admin-lib/src/router/create-router.tsx` | 应用侧 `src/router/index.tsx` 只做装配   |
| `src/router/auth-guard/`                            | 保留在应用内                                             | 依赖 store，属于业务                     |
| `src/components/page-loading/`                      | `packages/office-admin-components/src/loading/`          | `@office-admin/components/loading`       |
| `src/components/layouts/basic-layout/`              | `packages/office-admin-components/src/basic-layout/`     | `@office-admin/components/basic-layout`  |
| `src/components/layouts/header-bar/`                | `packages/office-admin-components/src/header-bar/`       | `@office-admin/components/header-bar`    |
| `src/components/layouts/side-menu/`                 | `packages/office-admin-components/src/side-menu/`        | `@office-admin/components/side-menu`     |
| `src/components/layouts/breadcrumbs/`               | `packages/office-admin-components/src/breadcrumbs/`      | `@office-admin/components/breadcrumbs`   |
| `src/pages/(auth)/403/`                             | `packages/office-admin-components/src/forbidden/`        | `@office-admin/components/forbidden`     |
| `src/pages/(auth)/404/` + `src/pages/not-found.tsx` | `packages/office-admin-components/src/not-found/`        | `@office-admin/components/not-found`     |
| `mock/*`                                            | `packages/office-admin-mock/src/*`                       | `@office-admin/mock`                     |

`admin-one` / `admin-two` 里已不存在 utils / mock / page-loading / 路由核心代码 / 403、404 页面 UI，
全部改为引用上表中的共享包。

## 规范配置说明

**两级 ESLint**：`eslint.config.base.json` 放公共规则（不写 `root`），
根目录与每个子工程的 `.eslintrc.json` 都只写 `"root": true` + `extends`。
这样规则只有一份，子工程单独跑 lint 时也不会向上漂移到别人的配置。

**为什么每个包都放一份 prettier / lint-staged 配置**：单独提交某个子工程（例如子工程有独立 git 仓库）时，
工具会以该包为根查找配置；内容与根目录完全一致，避免风格分叉。

**husky 只在根目录**：commit hook 属于仓库，不属于包。子工程 `prepare` 已移除，
避免在「没有 git 的子工程」里执行 husky 安装导致 `npm install` 失败。
`packages/admin-one/.husky/` 是迁移前遗留（它的独立 git 仓库仍在用），仓库统一到根之后可以删掉。

> 当前工作区尚未 `git init`。需要启用提交校验时：
> `git init && npm run prepare`。
> 注意 `packages/admin-one/.git` 是迁移前遗留的独立仓库，如果要在根仓库统一管理，
> 先 `rm -rf packages/admin-one/.git`（或用 `git bundle` 备份历史）。

## 新增一个应用

1. 复制 `packages/admin-one` 为 `packages/admin-xxx`（排除 `node_modules` / `dist` / `.git`）
2. 改 `package.json` 的 `name`、`vite.config.ts` 的 `server.port`、`index.html` 与 `.env.*` 的标题
3. 根 `package.json` 增加 `dev:xxx` / `build:xxx` 脚本
4. `npm install && npm run dev:xxx`

## 注意事项

- 共享包直接引用 `src/*.ts(x)`，**不要**在共享包里写 `@/` 别名（那是宿主应用的别名），跨包一律用包名导入
- 共享包内不要 import 宿主应用的文件，需要能力时通过「参数注入」暴露（参考 `createAppRouter` 的 `guard` / `fallback`）
- `@office-admin/mock` 的源码相对导入必须带 `.js` 后缀（NodeNext ESM 规范）
- mock 插件只在 dev server 生效（`apply: 'serve'`），生产构建不会包含任何 mock 代码；
  `.env` 里的 `VITE_USE_MOCK` 仅作为约定标记，需要按环境关闭时给 `mockPlugin` 传参即可
