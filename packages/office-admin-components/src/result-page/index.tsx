import { Result } from 'antd';
import type { ResultProps } from 'antd';
import type { CSSProperties, ReactNode } from 'react';
import styles from './index.module.scss';

export interface ResultPageProps {
  /** antd Result 的状态，决定图标与配色 */
  status: ResultProps['status'];
  /** 主标题 */
  title?: ReactNode;
  /** 副标题 / 说明文案 */
  subTitle?: ReactNode;
  /** 操作区（按钮组） */
  extra?: ReactNode;
  /** 垂直最小高度，默认撑满一屏 */
  minHeight?: number | string;
  className?: string;
  style?: CSSProperties;
}

const cx = (...names: Array<string | false | undefined>) => names.filter(Boolean).join(' ');

/**
 * 结果页外壳（内部组件，不对外暴露子路径）
 *
 * 403 / 404 这类「整页提示」共享的只有居中外壳与 Result 的透传，
 * 抽在这里避免两份 SCSS 与两份 flex 布局各自漂移。
 *
 * 样式自包含：不引用宿主 SCSS 变量 / mixin，颜色走 --app-* CSS 变量并带浅色回退。
 */
function ResultPage({
  status,
  title,
  subTitle,
  extra,
  minHeight = '100vh',
  className,
  style,
}: ResultPageProps) {
  return (
    <div className={cx(styles.wrap, className)} style={{ minHeight, ...style }} role="main">
      <Result status={status} title={title} subTitle={subTitle} extra={extra} />
    </div>
  );
}

export default ResultPage;
