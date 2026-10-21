import { Avatar, Dropdown, Space, Switch, Tooltip, Typography } from 'antd';
import {
  BulbOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MoonOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { startTransition, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './index.module.scss';

export interface HeaderBarUser {
  nickname?: string;
  avatar?: string;
}

export interface HeaderBarProps {
  /** 侧边栏是否折叠，仅用于切换图标方向 */
  collapsed?: boolean;
  /** 点折叠按钮的回调；不传则不渲染按钮 */
  onToggleCollapsed?: () => void;
  /** 当前主题，决定开关的选中态 */
  theme?: 'light' | 'dark';
  /** 切换主题；不传则不渲染开关 */
  onToggleTheme?: () => void;
  /** 面包屑等左侧内容 */
  breadcrumbs?: ReactNode;
  /** 当前登录用户 */
  user?: HeaderBarUser;
  /** 跳转个人中心的路径，默认 /profile */
  profilePath?: string;
  /** 自定义「个人中心」行为，优先于 profilePath */
  onProfile?: () => void;
  /** 退出登录；传了才渲染用户下拉里的退出项 */
  onLogout?: () => void | Promise<void>;
  /** 退出后跳转的路径，默认 /login */
  loginPath?: string;
  /** 右侧追加的自定义操作 */
  extra?: ReactNode;
  className?: string;
}

/**
 * 顶栏：折叠按钮 + 面包屑 + 主题开关 + 用户下拉
 *
 * 与状态管理无关：折叠/主题/用户都由 props 传入，
 * 唯一的副作用是「个人中心」「退出登录」两处跳转，走 react-router 的 navigate，
 * 宿主也可以用 onProfile / onLogout 完全接管。
 */
export default function HeaderBar({
  collapsed = false,
  onToggleCollapsed,
  theme = 'light',
  onToggleTheme,
  breadcrumbs,
  user,
  profilePath = '/profile',
  onProfile,
  onLogout,
  loginPath = '/login',
  extra,
  className,
}: HeaderBarProps) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await onLogout?.();
    startTransition(() => navigate(loginPath, { replace: true }));
  };

  const userMenuItems = [
    { key: 'profile', icon: <UserOutlined />, label: '个人中心' },
    ...(onLogout
      ? [
          { type: 'divider' as const },
          { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', danger: true },
        ]
      : []),
  ];

  return (
    <div className={[styles.header, className].filter(Boolean).join(' ')}>
      <Space size={12} align="center">
        {onToggleCollapsed ? (
          <span
            className={styles.trigger}
            onClick={onToggleCollapsed}
            role="button"
            tabIndex={0}
            aria-label="切换侧边栏"
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </span>
        ) : null}
        {breadcrumbs}
      </Space>

      <Space size={16} align="center">
        {extra}
        {onToggleTheme ? (
          <Tooltip title={theme === 'light' ? '切换深色' : '切换浅色'}>
            <Switch
              size="small"
              checked={theme === 'dark'}
              checkedChildren={<MoonOutlined />}
              unCheckedChildren={<BulbOutlined />}
              onChange={onToggleTheme}
            />
          </Tooltip>
        ) : null}

        <Dropdown
          menu={{
            items: userMenuItems,
            onClick: ({ key }) => {
              if (key === 'profile') {
                if (onProfile) onProfile();
                else startTransition(() => navigate(profilePath));
              }
              if (key === 'logout') void handleLogout();
            },
          }}
        >
          <Space className={styles.user} size={8}>
            <Avatar size={28} src={user?.avatar} icon={<UserOutlined />} />
            <Typography.Text className={styles.nickname}>{user?.nickname}</Typography.Text>
          </Space>
        </Dropdown>
      </Space>
    </div>
  );
}
