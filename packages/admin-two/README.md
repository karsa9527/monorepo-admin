# admin-two · 后台管理系统 B（Monorepo 子工程）

与 `admin-one` **同构**的第二套应用，用来验证共享包在多应用下的复用：
除「包名 / 端口 / 标题 / 品牌色 / Logo」外，代码结构与 `admin-one` 完全一致。

| 项目     | admin-one              | admin-two              |
| -------- | ---------------------- | ---------------------- |
| 包名     | `@office/admin-one`    | `@office/admin-two`    |
| 端口     | 5178                   | 5179                   |
| 应用标题 | Admin One 后台管理系统 | Admin Two 后台管理系统 |
| 品牌色   | `#1677ff`（蓝）        | `#722ed1`（紫）        |
| Logo     | A                      | B                      |

依赖全部来自同仓共享包，没有私有分支：

- `@office/lib` —— 工具函数 / 请求层 / 约定式路由核心
- `@office/components/loading` —— `Loading` 组件（无聚合出口，按子路径引入，且只提供默认导出）
- `@office/mock` —— 开发期 mock 数据与中间件

## 启动

```bash
# 仓库根目录
npm install
npm run dev:two      # http://localhost:5179

# 或只操作本包
npm run dev -w @office/admin-two
```

演示账号与 `admin-one` 相同（`admin / 123456`、`operator / 123456`），数据来自 `@office/mock`。

## 与 admin-one 的差异点

1. `package.json` 的 `name` 为 `@office/admin-two`
2. `vite.config.ts` 的 `server.port` 为 5179（并开启 `strictPort`，避免与 5178 抢占）
3. `index.html` / `.env.*` 的应用标题
4. `src/stores/app.ts` 的默认品牌色、`src/components/app-shell` 传给布局的 `logoMark`（`A` → `B`）

约定式路由、权限体系、请求层、主题、样式等实现均与 `admin-one` 共享或同构，
修改页面只需在 `src/pages` 下增删目录。
