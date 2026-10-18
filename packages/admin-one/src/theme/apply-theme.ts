import { themeTokens, type ThemeMode } from './tokens';

/** 主题落在 <html> 上的属性名，_theme.scss 里的选择器与它对应 */
export const THEME_ATTR = 'data-theme';

/** 读取系统偏好，首次访问（没有本地记录）时使用 */
export function getSystemTheme(): ThemeMode {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'light';
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * 把主题应用到文档
 *
 * 只做三件事，且都是同步的，所以切换时不会有一帧「旧颜色」：
 *   1. html[data-theme] → 触发 _theme.scss 里整套 CSS 变量替换
 *   2. color-scheme      → 浏览器原生控件（滚动条、输入框、日期选择器）跟着变
 *   3. theme-color       → 移动端浏览器地址栏颜色
 */
export function applyTheme(mode: ThemeMode, primaryColor?: string): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  root.setAttribute(THEME_ATTR, mode);
  root.style.colorScheme = mode;

  // 品牌色是运行时变量，改色时无需重新编译 SCSS
  if (primaryColor) {
    root.style.setProperty('--app-color-primary', primaryColor);
  }

  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', themeTokens[mode].bgLayout);
}
