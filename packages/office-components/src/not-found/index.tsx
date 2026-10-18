import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import ResultPage from '../result-page';

export interface NotFoundProps {
  /** 主标题，默认 404 */
  title?: ReactNode;
  /** 说明文案 */
  subTitle?: ReactNode;
  /** 按钮文案，传 null / '' 则不渲染按钮 */
  backText?: ReactNode;
  /** 返回按钮跳转的目标路径，默认首页 */
  backPath?: string;
  /** 自定义返回行为，优先于 backPath */
  onBack?: () => void;
  /** 自定义操作区，传入后完全替换默认按钮 */
  extra?: ReactNode;
  /** 垂直最小高度，默认 100vh；挂在布局内容区时可传数字或 100% */
  minHeight?: number | string;
  className?: string;
}

const DEFAULT_SUBTITLE = '抱歉，你访问的页面不存在或已被移除。';

/**
 * 404 页面不存在
 *
 * 两种挂载方式，都只写一行 re-export：
 *  - `pages/(auth)/404/page.tsx` —— 显式路由 /404
 *  - `pages/not-found.tsx`       —— 约定式路由的全局兜底（未命中的路径）
 *
 * 导出约定：组件**只有 default export**，使用方一律
 * `import NotFound from '@office/components/not-found'`。
 */
function NotFound({
  title = '404',
  subTitle = DEFAULT_SUBTITLE,
  backText = '返回首页',
  backPath = '/',
  onBack,
  extra,
  minHeight,
  className,
}: NotFoundProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    navigate(backPath, { replace: true });
  };

  return (
    <ResultPage
      status="404"
      title={title}
      subTitle={subTitle}
      minHeight={minHeight}
      className={className}
      extra={
        extra ??
        (backText ? (
          <Button type="primary" onClick={handleBack}>
            {backText}
          </Button>
        ) : null)
      }
    />
  );
}

export default NotFound;
