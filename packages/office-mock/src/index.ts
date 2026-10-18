/**
 * @office/mock
 *
 * 开发期 mock 数据与 vite 中间件插件，多个应用共用同一份接口约定：
 *   vite.config.ts -> import { mockPlugin } from '@office/mock'
 *
 * 注意：本包以「构建产物」形式被 Node 侧消费（vite.config 由 esbuild 打包并保持外部化），
 * 所以源码里的相对导入必须带 .js 后缀，由 tsc 输出到 dist 后才能被 ESM 正常解析。
 */
export { mockPlugin } from './mock-plugin.js';
export type { MockPluginOptions } from './mock-plugin.js';

export { mockRoutes } from './handlers.js';

export { ACCOUNTS, PERMISSIONS, ROLE_LIST, USER_LIST } from './db.js';
export type { MockRole, MockUser } from './db.js';

export type { MockHandler, MockRequest, MockResult, MockRoute } from './types.js';
