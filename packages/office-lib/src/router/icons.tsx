import type { ReactNode } from 'react';
import {
  AppstoreOutlined,
  DashboardOutlined,
  ExceptionOutlined,
  KeyOutlined,
  MenuOutlined,
  ProfileOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';

/**
 * 图标注册表
 *
 * route.meta.ts 是纯数据文件，会被 eager 扫描进主包。
 * 若在 meta 里直接 import antd 图标组件，图标会随 meta 一起被打包，
 * 也无法做「菜单先于页面加载」的静态解析。
 * 因此 meta 里只写图标名字符串，在渲染前由 resolveIcon 统一映射成组件。
 *
 * 业务侧新增图标时调用 registerIcons，无需改动本包：
 *   registerIcons({ order: <ShoppingCartOutlined /> });
 */
const BUILTIN_ICONS = {
  app: <AppstoreOutlined />,
  dashboard: <DashboardOutlined />,
  setting: <SettingOutlined />,
  team: <TeamOutlined />,
  key: <KeyOutlined />,
  menu: <MenuOutlined />,
  user: <UserOutlined />,
  profile: <ProfileOutlined />,
  safety: <SafetyCertificateOutlined />,
  exception: <ExceptionOutlined />,
} as const;

/** 运行时图标注册表：内置 + 业务注册 */
export const iconMap: Record<string, ReactNode> = { ...BUILTIN_ICONS };

/** 内置图标名（有字面量类型，写错会有提示） */
export type BuiltinIconName = keyof typeof BUILTIN_ICONS;

/** 可在 route.meta.ts 中使用的图标名：内置名 + registerIcons 注册的自定义名 */
export type IconName = BuiltinIconName | (string & Record<never, never>);

/** 注册业务图标；同名时覆盖内置图标 */
export function registerIcons(icons: Record<string, ReactNode>): void {
  Object.assign(iconMap, icons);
}

/** 把图标名解析成 ReactNode；已是 ReactNode 时原样返回 */
export function resolveIcon(icon?: IconName | ReactNode): ReactNode {
  if (!icon) return undefined;
  if (typeof icon !== 'string') return icon;

  const node = iconMap[icon];
  if (!node && import.meta.env.DEV) {
    console.warn(`[router] 未注册的图标名 "${icon}"，请先调用 registerIcons 注册`);
  }
  return node;
}
