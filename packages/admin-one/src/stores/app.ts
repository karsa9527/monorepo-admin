import { makeAutoObservable } from 'mobx';
import type { RootStore } from './index';
import { storage } from '@office-admin/lib';
import { applyTheme, getSystemTheme, type ThemeMode } from '@/theme';

export type { ThemeMode };
export type DeviceType = 'desktop' | 'mobile';

const COLLAPSED_KEY = 'sidebar-collapsed';
const THEME_KEY = 'theme-mode';

/** 读取本地主题设置，非法值或未设置时回退到系统偏好 */
function readStoredTheme(): ThemeMode {
  const stored = storage.get<ThemeMode>(THEME_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return getSystemTheme();
}

/** 全局 UI 状态：布局、主题、全局 loading、设备类型 */
export class AppStore {
  root: RootStore;

  /** 侧边栏折叠 */
  collapsed = storage.get<boolean>(COLLAPSED_KEY, false) ?? false;
  /** 主题模式：优先本地记忆，否则跟随系统偏好 */
  theme: ThemeMode = readStoredTheme();
  /** 主题色 */
  primaryColor = '#1677ff';
  /** 设备类型 */
  device: DeviceType = window.innerWidth < 768 ? 'mobile' : 'desktop';
  /** 全局请求中数量（由请求库 loading 计数驱动） */
  requestPending = 0;
  /** 路由切换中的进度条 */
  routeLoading = false;

  constructor(root: RootStore) {
    this.root = root;
    makeAutoObservable(this, { root: false }, { autoBind: true });
    // 首屏落地：把主题写到 <html data-theme>，CSS 变量随之生效
    applyTheme(this.theme, this.primaryColor);
    window.addEventListener('resize', () => this.detectDevice());
  }

  get isMobile(): boolean {
    return this.device === 'mobile';
  }

  get globalLoading(): boolean {
    return this.requestPending > 0;
  }

  detectDevice() {
    const next = window.innerWidth < 768 ? 'mobile' : 'desktop';
    if (next !== this.device) this.device = next;
    if (next === 'mobile' && !this.collapsed) this.collapsed = true;
  }

  toggleCollapsed() {
    this.collapsed = !this.collapsed;
    storage.set(COLLAPSED_KEY, this.collapsed);
  }

  setCollapsed(value: boolean) {
    this.collapsed = value;
    storage.set(COLLAPSED_KEY, value);
  }

  toggleTheme() {
    this.setTheme(this.theme === 'light' ? 'dark' : 'light');
  }

  setTheme(theme: ThemeMode) {
    this.theme = theme;
    storage.set(THEME_KEY, theme);
    applyTheme(theme, this.primaryColor);
  }

  setPrimaryColor(color: string) {
    this.primaryColor = color;
    applyTheme(this.theme, color);
  }

  setRequestPending(count: number) {
    this.requestPending = count;
  }

  setRouteLoading(value: boolean) {
    this.routeLoading = value;
  }

  dispose() {
    window.removeEventListener('resize', () => this.detectDevice());
  }
}
