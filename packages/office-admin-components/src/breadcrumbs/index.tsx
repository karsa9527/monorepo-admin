import { Breadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

export interface BreadcrumbItem {
  title: ReactNode;
  /** 有 path 时可点击；最后一项通常不传 */
  path?: string;
}

export interface BreadcrumbsProps {
  /** 面包屑链路，不含首页（首页由 homePath 控制） */
  items?: BreadcrumbItem[];
  /** 首页图标链接，默认 /dashboard；传 false 不渲染首页 */
  homePath?: string | false;
  /** 首页图标，默认 HomeOutlined */
  homeIcon?: ReactNode;
  className?: string;
}

/**
 * 面包屑：纯展示组件
 *
 * 链路数据由调用方算好传入（通常来自路由 meta / flatRoutes），
 * 组件只负责「非末项可点、末项纯文本」的渲染规则。
 */
export default function Breadcrumbs({
  items = [],
  homePath = '/dashboard',
  homeIcon,
  className,
}: BreadcrumbsProps) {
  return (
    <Breadcrumb
      className={className}
      items={[
        ...(homePath === false
          ? []
          : [
              {
                title: <Link to={homePath}>{homeIcon ?? <HomeOutlined />}</Link>,
              },
            ]),
        ...items.map((item, index) => ({
          title:
            item.path && index < items.length - 1 ? (
              <Link to={item.path}>{item.title}</Link>
            ) : (
              item.title
            ),
        })),
      ]}
    />
  );
}
