import { Outlet } from 'react-router-dom';

/**
 * 独立页布局：不带侧边栏与顶栏
 * 登录、403、404 等页面挂在这个路由组下
 */
export default function BlankLayout() {
  return <Outlet />;
}
