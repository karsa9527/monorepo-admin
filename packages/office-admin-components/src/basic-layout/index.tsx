import { Suspense, type ReactNode } from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import Loading from '../loading';
import styles from './index.module.scss';

export interface BasicLayoutProps {
  /** 侧边栏展开时显示的标题 */
  title?: ReactNode;
  /** Logo 里的一两个字，例如应用的英文首字母 */
  logoMark?: ReactNode;
  /** 侧边栏是否折叠 */
  collapsed?: boolean;
  /** 侧边栏宽度，默认 216 */
  siderWidth?: number;
  /** 主题，透传 antd Layout.Sider / Menu */
  theme?: 'light' | 'dark';
  /** 顶部请求进度条 */
  loading?: boolean;
  /** 内容区上方的顶栏 */
  header?: ReactNode;
  /** 侧边栏菜单 */
  menu?: ReactNode;
  /** 内容区；不传则渲染路由出口 <Outlet /> */
  children?: ReactNode;
  /** Suspense fallback，默认用本包的 Loading */
  fallback?: ReactNode;
  /** 页脚；不传则不渲染 */
  footer?: ReactNode;
  className?: string;
}

const cx = (...names: Array<string | false | undefined>) => names.filter(Boolean).join(' ');

/**
 * 后台基础布局：侧边菜单 + 顶栏 + 内容区（+ 可选页脚）
 *
 * 不做任何数据获取，也不依赖状态管理库：
 * 折叠态、主题、菜单、顶栏全部由调用方通过 props 注入，
 * 因此同一个布局可以直接给不同技术栈（MobX / Redux / Zustand）的宿主复用。
 *
 * 唯一的约定是路由：内容区缺省渲染 <Outlet />，由宿主的 RouterProvider 提供上下文。
 */
export default function BasicLayout({
  title,
  logoMark = 'A',
  collapsed = false,
  siderWidth = 216,
  theme = 'light',
  loading = false,
  header,
  menu,
  children,
  fallback,
  footer,
  className,
}: BasicLayoutProps) {
  return (
    <Layout className={cx(styles.layout, className)} hasSider>
      <Layout.Sider
        collapsible
        collapsed={collapsed}
        trigger={null}
        width={siderWidth}
        theme={theme}
        className={styles.sider}
      >
        <div className={styles.logo}>
          <span className={styles.logoMark}>{logoMark}</span>
          {!collapsed && title ? <span className={styles.logoText}>{title}</span> : null}
        </div>
        <div className={styles.menuWrap}>{menu}</div>
      </Layout.Sider>

      <Layout>
        <Layout.Header className={styles.header}>
          {header}
          {loading ? <div className={styles.progress} /> : null}
        </Layout.Header>

        <Layout.Content className={styles.content}>
          <Suspense fallback={fallback ?? <Loading full={false} />}>
            {children ?? <Outlet />}
          </Suspense>
        </Layout.Content>

        {footer ? <Layout.Footer className={styles.footer}>{footer}</Layout.Footer> : null}
      </Layout>
    </Layout>
  );
}
