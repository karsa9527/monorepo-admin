import { Request, type RequestHooks, type RequestInstanceOptions } from './request';

export * from './types';
export * from './error';
export { Request, SUCCESS_CODES } from './request';

const defaultOptions: RequestInstanceOptions = {
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  timeout: Number(import.meta.env.VITE_REQUEST_TIMEOUT ?? 15000),
  withCredentials: false,
};

/** 全局默认实例 */
export const http = new Request(defaultOptions);

/** 供 App 初始化时注入 UI 相关钩子 */
export function setupRequestHooks(hooks: RequestHooks) {
  http.setHooks(hooks);
  return http;
}

/** 创建独立实例（对接第三方接口 / 不同 baseURL） */
export function createRequest(options: RequestInstanceOptions = {}, hooks: RequestHooks = {}) {
  return new Request({ ...defaultOptions, ...options }, hooks);
}
