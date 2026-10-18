/**
 * 环境变量与运行环境判定
 *
 * 只依赖 Vite 注入的 import.meta.env，不引用构建期自定义全局变量，
 * 这样本包既能被应用以源码方式消费，也能单独 typecheck。
 */

const rawEnv = (import.meta.env ?? {}) as unknown as Record<string, string | undefined>;

function pick<T extends string = string>(key: string, fallback: T): T {
  const value = rawEnv[key];
  return (value === undefined || value === '' ? fallback : value) as T;
}

export const env = {
  get BASE_URL() {
    return pick('VITE_API_BASE_URL', '/api');
  },
  get TIMEOUT() {
    return Number(pick('VITE_REQUEST_TIMEOUT', '15000'));
  },
  get APP_TITLE() {
    return pick('VITE_APP_TITLE', '后台管理系统');
  },
  get USE_MOCK() {
    return pick<string>('VITE_USE_MOCK', 'false') === 'true';
  },
  get ROUTER_MODE(): 'hash' | 'browser' {
    return pick<'hash' | 'browser'>('VITE_ROUTER_MODE', 'hash');
  },
  get MODE(): string {
    return pick<string>('MODE', 'development');
  },
  get isDev() {
    return this.MODE === 'development' || this.MODE === 'dev';
  },
  get isProd() {
    return this.MODE === 'production';
  },
  /** 是否为浏览器环境（SSR 安全） */
  get isBrowser() {
    return typeof window !== 'undefined';
  },
};

export default env;
