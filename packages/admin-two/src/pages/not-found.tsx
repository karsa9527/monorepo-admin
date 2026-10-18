/**
 * 全局 404 兜底：匹配所有未命中的路径
 *
 * 与 (auth)/404 共用 @office/components/not-found，构建后是同一个 chunk。
 */
export { default } from '@office/components/not-found';
