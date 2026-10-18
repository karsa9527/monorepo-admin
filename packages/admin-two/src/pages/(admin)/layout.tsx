/**
 * 后台主区域布局：侧边栏 + 顶栏 + 内容区
 *
 * 布局本体在 @office/components（basic-layout / header-bar / side-menu / breadcrumbs），
 * 这里只负责把 store 里的状态注入进去；约定式目录只声明「谁用这个布局」。
 */
export { default } from '@/components/app-shell';
