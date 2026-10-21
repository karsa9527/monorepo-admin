import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import ResultPage from '../result-page';

export interface ForbiddenProps {
  /** 主标题，默认 403 */
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

const DEFAULT_SUBTITLE = '抱歉，你没有权限访问该页面，请联系管理员开通权限。';

/**
 * 403 无权限页
 *
 * 用法：
 *  1. 直接挂到约定式路由的 page.tsx 上，零配置
 *     `export { default } from '@office-admin/components/forbidden';`
 *  2. 传 props 覆盖文案 / 按钮 / 返回目标
 *     `<Forbidden subTitle="仅管理员可访问" backPath="/dashboard" />`
 *
 * 返回按钮默认走 react-router 的 `navigate(backPath, { replace: true })`
 * （replace 是为了不把 403 留进历史栈），也可以用 `onBack` 完全接管。
 *
 * 导出约定：组件**只有 default export**，使用方一律
 * `import Forbidden from '@office-admin/components/forbidden'`。
 */
function Forbidden({
  title = '403',
  subTitle = DEFAULT_SUBTITLE,
  backText = '返回首页',
  backPath = '/',
  onBack,
  extra,
  minHeight,
  className,
}: ForbiddenProps) {
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
      status="403"
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

export default Forbidden;
