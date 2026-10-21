import type { Plugin, Connect } from 'vite';
import type { ServerResponse } from 'node:http';
import { mockRoutes } from './handlers.js';
import type { MockRoute } from './types.js';

export interface MockPluginOptions {
  /** 需要拦截的路径前缀，默认 /api */
  prefix?: string;
  /** 全局延迟（ms），设置后覆盖单条路由自身的 delay */
  delay?: number;
  /** 命中 mock 时打印一条日志，默认开启 */
  log?: boolean;
}

function readBody(req: Connect.IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = [];
    req.on('data', (c: Buffer) => chunks.push(c));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf-8');
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw) as Record<string, unknown>);
      } catch {
        resolve({});
      }
    });
  });
}

function sendJson(res: ServerResponse, status: number, payload: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json;charset=utf-8');
  res.end(JSON.stringify(payload));
}

/** 把 /api/system/users/:id 编译成正则，同时抽取 params */
function compile(pattern: string) {
  const keys: string[] = [];
  const regex = new RegExp(
    '^' +
      pattern.replace(/:([A-Za-z0-9_]+)/g, (_m, key: string) => {
        keys.push(key);
        return '([^/]+)';
      }) +
      '$',
  );
  return { regex, keys };
}

const compiled = mockRoutes.map((r) => ({ ...r, ...compile(r.url) }));

function matchRoute(method: string, pathname: string) {
  return compiled.find(
    (r) => r.method.toUpperCase() === method.toUpperCase() && r.regex.test(pathname),
  ) as (MockRoute & { regex: RegExp; keys: string[] }) | undefined;
}

/**
 * 轻量 mock 中间件：仅开发环境生效
 *
 * 未匹配到的请求会 next()，交给 vite 代理或静态服务处理，
 * 因此「一部分接口 mock、另一部分接口走真实后端」可以共存。
 */
export function mockPlugin(options: MockPluginOptions = {}): Plugin {
  const { prefix = '/api', delay, log = true } = options;

  return {
    name: 'office:mock',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || '';
        const [pathname, search = ''] = url.split('?');
        if (!pathname.startsWith(prefix)) return next();

        const route = matchRoute(req.method || 'GET', pathname);
        if (!route) return next();

        const query: Record<string, string> = {};
        new URLSearchParams(search).forEach((v, k) => {
          query[k] = v;
        });
        // 路径参数合并进 query，方便 handler 取用
        const matched = route.regex.exec(pathname);
        route.keys.forEach((k, i) => {
          query[k] = matched?.[i + 1] ?? '';
        });

        const wait = delay ?? route.delay ?? 0;
        if (log) {
          console.info(`[mock] ${req.method} ${pathname}${wait ? ` (${wait}ms)` : ''}`);
        }

        try {
          const body = ['POST', 'PUT', 'PATCH'].includes((req.method || '').toUpperCase())
            ? await readBody(req)
            : {};
          if (wait) {
            await new Promise((r) => setTimeout(r, wait));
          }
          const result = await route.handler({
            body,
            query,
            headers: req.headers as Record<string, string>,
          });
          sendJson(res, 200, result);
        } catch (err) {
          sendJson(res, 500, {
            code: 500,
            data: null,
            message: (err as Error).message || 'mock 处理异常',
          });
        }
      });
    },
  };
}
