import { startTransition, useEffect, useRef, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

export interface RedirectProps {
  to: string;
  replace?: boolean;
  state?: unknown;
  /** 跳转落地前展示的内容，默认不渲染 */
  fallback?: ReactNode;
}

/**
 * 过渡安全的跳转组件
 *
 * 为什么不用 <Navigate>：
 * 路由守卫 / 登录页的跳转往往发生在「离散事件」的同步渲染里，
 * 此时目标若是 React.lazy 页面，会抛
 * "A component suspended while responding to synchronous input"。
 * 这里把跳转放进 useEffect + startTransition，让整个更新以过渡方式执行，
 * 懒加载 chunk 未就绪时由 Suspense 正常兜底。
 */
export default function Redirect({ to, replace = true, state, fallback = null }: RedirectProps) {
  const navigate = useNavigate();
  // 同一个 to 只跳一次，避免 effect 因 state 引用变化而重复执行
  const doneRef = useRef<string | null>(null);

  useEffect(() => {
    if (doneRef.current === to) return;
    doneRef.current = to;
    startTransition(() => {
      navigate(to, { replace, state });
    });
  }, [navigate, replace, state, to]);

  return <>{fallback}</>;
}
