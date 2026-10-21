import { startTransition, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { useLocation, useNavigate } from 'react-router-dom';
import type { MenuProps } from 'antd';
import { env } from '@office-admin/lib';
import type { MenuNode } from '@office-admin/lib/router';
import BasicLayout from '@office-admin/components/basic-layout';
import HeaderBar from '@office-admin/components/header-bar';
import SideMenu from '@office-admin/components/side-menu';
import Breadcrumbs, { type BreadcrumbItem } from '@office-admin/components/breadcrumbs';
import { useAppStore, useAuthStore, usePermissionStore } from '@/stores';

type AntdMenuItems = NonNullable<MenuProps['items']>;

/** 路由菜单树 → antd Menu items（key 沿用完整路径，子菜单递归转换） */
function toMenuItems(nodes: MenuNode[]): AntdMenuItems {
  return nodes.map((node) => ({
    key: node.key,
    icon: node.icon,
    label: node.label,
    ...(node.children?.length ? { children: toMenuItems(node.children) } : {}),
  })) as AntdMenuItems;
}

/**
 * 应用级布局容器（容器组件 / smart component）—— admin-two 与 admin-one 同构，只有 Logo 标记不同
 *
 * 职责只有一件：把 MobX store 里的状态翻译成 @office-admin/components 布局组件的 props。
 * 布局本身（BasicLayout / HeaderBar / SideMenu / Breadcrumbs）在组件库里，
 * 不认识 MobX，也不认识本项目的 store，所以能直接被其它宿主复用。
 */
const AppShell = observer(function AppShell() {
  const app = useAppStore();
  const auth = useAuthStore();
  const permission = usePermissionStore();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = useMemo(() => toMenuItems(permission.menus), [permission.menus]);

  // 面包屑：按当前路径在扁平路由表里找最长匹配（详情页也能命中父级链路）
  const crumbs = useMemo<BreadcrumbItem[]>(() => {
    const { pathname } = location;
    const current =
      permission.flatRoutes.find((r) => r.fullPath === pathname) ??
      permission.flatRoutes.find((r) => pathname.startsWith(`${r.fullPath}/`));
    return (current?.breadcrumbs ?? []).map((c) => ({ title: c.title, path: c.path }));
  }, [permission.flatRoutes, location]);

  return (
    <BasicLayout
      title={env.APP_TITLE}
      logoMark="B"
      collapsed={app.collapsed}
      theme={app.theme}
      loading={app.globalLoading}
      footer={`${env.APP_TITLE} · React + TypeScript + MobX`}
      menu={
        <SideMenu
          items={menuItems}
          theme={app.theme}
          // 目标页是懒加载 chunk：用 transition 导航，挂起交给 Suspense
          onNavigate={(key) => startTransition(() => navigate(key))}
        />
      }
      header={
        <HeaderBar
          collapsed={app.collapsed}
          onToggleCollapsed={app.toggleCollapsed}
          theme={app.theme}
          onToggleTheme={app.toggleTheme}
          breadcrumbs={<Breadcrumbs items={crumbs} homePath="/dashboard" />}
          user={{ nickname: auth.nickname, avatar: auth.avatar }}
          onLogout={auth.logout}
        />
      }
    />
  );
});

export default AppShell;
