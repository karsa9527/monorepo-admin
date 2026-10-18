import type { ReactNode } from 'react';
import type { IconName } from './icons';

/** 路由元信息：权限、菜单、缓存等配置都挂在这里 */
export interface RouteMeta {
  /** 菜单 / 面包屑 / 页签标题（纯分组或重定向节点可不填） */
  title?: string;
  /** 菜单图标（已解析为 ReactNode） */
  icon?: ReactNode;
  /** 访问所需权限点：字符串=需满足，数组=满足其一即可 */
  permission?: string | string[];
  /** 访问所需角色：满足其一即可 */
  roles?: string[];
  /** 是否在菜单中隐藏 */
  hideInMenu?: boolean;
  /** 是否隐藏所有子菜单（父级直接作为叶子节点） */
  hideChildrenInMenu?: boolean;
  /** 跳过登录校验（登录页、404 等） */
  ignoreAuth?: boolean;
  /** 自定义菜单排序，越小越靠前 */
  order?: number;
  /** 页面是否缓存 */
  keepAlive?: boolean;
  /** 外链地址，配置后点击新窗口打开 */
  target?: string;
  /** 是否固定在页签（不可关闭） */
  affix?: boolean;
  /** 访问该路径时自动重定向（如根路径 -> /dashboard） */
  redirect?: string;
}

/**
 * route.meta.ts 中声明的元信息
 *
 * 与 RouteMeta 的区别只有 icon：约定式路由下 meta 是纯数据文件，
 * 图标用字符串名（见 router/icons.tsx），由生成器在运行时解析成组件。
 */
export interface RouteMetaInput extends Omit<RouteMeta, 'icon'> {
  icon?: IconName | ReactNode;
}

/** 应用路由节点 */
export interface AppRouteObject {
  /** 路径，支持 react-router 的相对/绝对路径 */
  path?: string;
  index?: boolean;
  element?: ReactNode;
  /** 重定向地址，存在时自动生成 <Navigate> */
  redirect?: string;
  meta?: RouteMeta;
  children?: AppRouteObject[];
  /** 404 兜底 */
  errorElement?: ReactNode;
  /** 是否需要外层 Suspense 边界（懒加载布局 / 顶层独立页面） */
  suspense?: boolean;
  /** Suspense 的 fallback，缺省用 PageLoading */
  fallback?: ReactNode;
}

/** 扁平化后的路由项（用于面包屑 / 页签匹配） */
export interface FlatRoute {
  /** 完整路径 */
  fullPath: string;
  meta?: RouteMeta;
  /** 面包屑链路 */
  breadcrumbs: Array<{ path: string; title: string }>;
}
