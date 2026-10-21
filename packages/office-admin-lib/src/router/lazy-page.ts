import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

const RELOAD_KEY = 'chunk-reload-at';
/** 自动刷新防抖窗口：5 分钟内只刷新一次，避免死循环 */
const RELOAD_WINDOW = 5 * 60 * 1000;

/** 判断是否为「chunk 加载失败」（多见于发版后旧 hash 文件被清理） */
function isChunkLoadError(error: unknown): boolean {
  const message = (error as Error)?.message ?? '';
  return /Failed to fetch dynamically imported module|Importing a module script failed|Loading chunk \S+ failed|error loading dynamically imported module/i.test(
    message,
  );
}

/**
 * 路由级懒加载
 *
 * - 每个页面产出独立 chunk，首屏只下载当前路由对应的代码
 * - 发版后旧 chunk 404 导致白屏时，自动整页刷新一次拿新入口
 * - 统一由路由层的 Suspense 兜底（见 router/index.tsx 与 BasicLayout）
 */
export function lazyPage<P = Record<string, never>>(
  factory: () => Promise<{ default: ComponentType<P> }>,
): LazyExoticComponent<ComponentType<P>> {
  return lazy(() =>
    factory().catch((error: unknown) => {
      if (isChunkLoadError(error)) {
        const last = Number(sessionStorage.getItem(RELOAD_KEY) ?? 0);
        if (Date.now() - last > RELOAD_WINDOW) {
          sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
          window.location.reload();
        }
      }
      throw error;
    }),
  );
}

export default lazyPage;
