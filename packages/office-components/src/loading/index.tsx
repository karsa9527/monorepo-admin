import { Spin } from 'antd';
import type { SpinProps } from 'antd';
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import styles from './index.module.scss';

export interface LoadingProps {
  /** 提示文案，纯占位模式下渲染在图标下方 */
  tip?: ReactNode;
  /** 尺寸，透传 antd Spin */
  size?: SpinProps['size'];
  /** 受控开关，默认 true；包裹 children 时用作遮罩开关 */
  spinning?: boolean;
  /** 撑满一屏（路由级 / 首屏 loading），false 时为局部占位 */
  full?: boolean;
  /** 局部占位时的最小高度，默认 160，full / overlay 模式下忽略 */
  minHeight?: number | string;
  /**
   * 延迟显示（毫秒），默认 0 立即显示。
   * 接口很快时延迟 200ms 左右能避免 loading 一闪而过。
   */
  delay?: number;
  /** 覆盖父容器（父级需 position: relative），用于卡片 / 表格局部刷新 */
  overlay?: boolean;
  /** 被包裹的内容：传入时走 antd 容器模式，不传则只渲染占位块 */
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

const cx = (...names: Array<string | false | undefined>) => names.filter(Boolean).join(' ');

/**
 * 通用加载占位组件
 *
 * 三种形态：
 *  1. 整屏      <Loading tip="正在初始化…" />
 *  2. 局部占位  <Loading full={false} minHeight={200} />
 *  3. 容器遮罩  <Loading spinning={loading}>{content}</Loading>
 *
 * 样式自包含：不依赖宿主项目的 SCSS 变量 / mixin，
 * 颜色优先取宿主定义的 --app-* CSS 变量，取不到时回退到浅色主题色值。
 *
 * 导出约定：组件**只有 default export**，使用方一律
 * `import Loading from '@office/components/loading'`；
 * 不要再加具名导出（`export { Loading }`），保证「一个文件一个组件、一个入口一个默认导出」。
 */
function Loading({
  tip = '加载中…',
  size = 'large',
  spinning = true,
  full = true,
  minHeight = 160,
  delay = 0,
  overlay = false,
  children,
  className,
  style,
}: LoadingProps) {
  const [ready, setReady] = useState(() => !spinning || delay <= 0);

  useEffect(() => {
    if (!spinning) {
      setReady(false);
      return;
    }
    if (delay <= 0) {
      setReady(true);
      return;
    }
    const timer = window.setTimeout(() => setReady(true), delay);
    return () => window.clearTimeout(timer);
  }, [spinning, delay]);

  const show = spinning && ready;

  // 容器模式：交给 antd Spin 处理遮罩、尺寸与子内容
  if (children !== undefined) {
    return (
      <Spin spinning={show} size={size} tip={tip} wrapperClassName={className}>
        {children}
      </Spin>
    );
  }

  return (
    <div
      className={cx(
        styles.base,
        full ? styles.full : styles.inline,
        overlay && styles.overlay,
        className,
      )}
      style={{
        ...(full || overlay ? null : { minHeight }),
        ...style,
      }}
      role="status"
      aria-live="polite"
      aria-busy={show}
    >
      {show ? (
        <div className={styles.spinner}>
          <Spin size={size} />
          {tip ? <span className={styles.tip}>{tip}</span> : null}
        </div>
      ) : null}
    </div>
  );
}

export default Loading;
