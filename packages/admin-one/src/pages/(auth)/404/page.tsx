/**
 * 404 页面不存在（显式路由 /404）
 *
 * 页面本体在 @office-admin/components（`not-found` 子路径），这里只做导入；
 * 根目录 not-found.tsx 与它指向同一个模块，构建后共享同一个 chunk。
 */
export { default } from '@office-admin/components/not-found';
