/**
 * 设计令牌（Design Tokens）
 *
 * 这里是 antd 全局主题的唯一数据源；`src/styles/_theme.scss` 里的 CSS 变量
 * 与下面同名字段一一对应（那边给自定义样式用，这边给 antd 组件用）。
 * 改色时两处同步，品牌色例外：由 AppStore.setPrimaryColor 运行时注入 CSS 变量。
 */

export type ThemeMode = 'light' | 'dark';

export interface ThemeTokens {
  /** 品牌色 */
  colorPrimary: string;
  /** 基础圆角 */
  borderRadius: number;
  /** 大圆角（卡片 / 弹层） */
  borderRadiusLG: number;
  /** 页面背景 */
  bgLayout: string;
  /** 容器背景（卡片、顶栏、浅色侧边栏） */
  bgContainer: string;
  /** 浮层背景（下拉、弹窗） */
  bgElevated: string;
  /** 侧边栏背景 */
  siderBg: string;
  /** 正文 / 次要 / 辅助文本 */
  text: string;
  textSecondary: string;
  textTertiary: string;
  /** 边框 */
  border: string;
  borderSecondary: string;
  /** 顶栏、卡片投影 */
  shadowHeader: string;
  shadowCard: string;
  /** 布局尺寸 */
  headerHeight: number;
  siderWidth: number;
}

/** 与 _config.scss 的 $font-family 保持一致 */
export const FONT_FAMILY =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif";

export const themeTokens: Record<ThemeMode, ThemeTokens> = {
  light: {
    colorPrimary: '#1677ff',
    borderRadius: 6,
    borderRadiusLG: 8,
    bgLayout: '#f5f7fa',
    bgContainer: '#ffffff',
    bgElevated: '#ffffff',
    siderBg: '#ffffff',
    text: 'rgba(0, 0, 0, 0.88)',
    textSecondary: 'rgba(0, 0, 0, 0.65)',
    textTertiary: 'rgba(0, 0, 0, 0.45)',
    border: 'rgba(5, 5, 5, 0.12)',
    borderSecondary: 'rgba(5, 5, 5, 0.06)',
    shadowHeader: '0 1px 4px rgba(0, 21, 41, 0.08)',
    shadowCard: '0 12px 40px rgba(0, 21, 41, 0.10)',
    headerHeight: 56,
    siderWidth: 216,
  },
  dark: {
    colorPrimary: '#1677ff',
    borderRadius: 6,
    borderRadiusLG: 8,
    bgLayout: '#0f1115',
    bgContainer: '#171a1f',
    bgElevated: '#1f2329',
    siderBg: '#12161b',
    text: 'rgba(255, 255, 255, 0.88)',
    textSecondary: 'rgba(255, 255, 255, 0.65)',
    textTertiary: 'rgba(255, 255, 255, 0.45)',
    border: 'rgba(255, 255, 255, 0.14)',
    borderSecondary: 'rgba(255, 255, 255, 0.08)',
    shadowHeader: '0 1px 4px rgba(0, 0, 0, 0.45)',
    shadowCard: '0 12px 40px rgba(0, 0, 0, 0.45)',
    headerHeight: 56,
    siderWidth: 216,
  },
};

/** 取当前模式令牌，可覆盖品牌色 */
export function getThemeTokens(mode: ThemeMode, primaryColor?: string): ThemeTokens {
  const tokens = themeTokens[mode];
  return primaryColor ? { ...tokens, colorPrimary: primaryColor } : tokens;
}
