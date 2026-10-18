import { theme, type ThemeConfig } from 'antd';
import { FONT_FAMILY, getThemeTokens, type ThemeMode } from './tokens';

export interface CreateAntdThemeOptions {
  mode: ThemeMode;
  /** 品牌色，默认 #1677ff */
  primaryColor?: string;
}

/**
 * antd 全局样式配置（唯一入口）
 *
 * 分三层，改样式基本只动这个文件：
 *   1. algorithm —— 浅色 / 深色算法，负责推出全部派生色（hover、disabled、border…）
 *   2. token     —— 全局 design token，影响所有组件
 *   3. components—— 单个组件的覆写，用来做「全局风格统一」，避免满页面写 style
 *
 * 开启 cssVar 后 antd 把 token 以 `--ant-*` 变量下发到 ConfigProvider 容器
 * （类名形如 .css-var-r1），切主题只替换变量值；容器内的自定义样式因此也能
 * 直接写 var(--ant-color-primary)，但 html / body 上取不到这些变量。
 */
export function createAntdTheme({ mode, primaryColor }: CreateAntdThemeOptions): ThemeConfig {
  const t = getThemeTokens(mode, primaryColor);
  const isDark = mode === 'dark';

  return {
    cssVar: true,
    hashed: false,
    algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,

    // ---------- 全局 token ----------
    token: {
      colorPrimary: t.colorPrimary,
      colorBgLayout: t.bgLayout,
      colorBgContainer: t.bgContainer,
      colorBgElevated: t.bgElevated,
      colorText: t.text,
      colorTextSecondary: t.textSecondary,
      colorTextTertiary: t.textTertiary,
      colorBorder: t.border,
      colorBorderSecondary: t.borderSecondary,
      borderRadius: t.borderRadius,
      borderRadiusLG: t.borderRadiusLG,
      fontFamily: FONT_FAMILY,
      fontSize: 14,
      wireframe: false,
    },

    // ---------- 组件级覆写 ----------
    components: {
      // 布局：背景/顶栏/侧边栏统一由主题驱动
      Layout: {
        bodyBg: t.bgLayout,
        headerBg: t.bgContainer,
        headerHeight: t.headerHeight,
        headerPadding: '0 16px',
        footerBg: t.bgLayout,
        footerPadding: '12px 16px',
        siderBg: t.siderBg,
        lightSiderBg: t.siderBg,
        triggerBg: t.bgElevated,
      },

      // 菜单：背景透明，让侧边栏底色透出来；间距统一
      Menu: {
        itemBorderRadius: t.borderRadius,
        itemHeight: 40,
        itemMarginInline: 8,
        itemMarginBlock: 4,
        iconSize: 16,
        collapsedWidth: 48,
        groupTitleFontSize: 12,
        itemBg: 'transparent',
        subMenuItemBg: 'transparent',
        popupBg: t.bgElevated,
        darkItemBg: 'transparent',
        darkSubMenuItemBg: 'transparent',
        darkPopupBg: t.bgElevated,
        darkItemSelectedBg: t.colorPrimary,
      },

      Card: {
        headerBg: 'transparent',
        bodyPadding: 16,
      },

      Table: {
        headerBg: isDark ? t.bgElevated : '#fafafa',
        headerSplitColor: 'transparent',
        borderColor: t.borderSecondary,
        rowHoverBg: isDark ? 'rgba(255, 255, 255, 0.04)' : '#fafafa',
      },

      Breadcrumb: {
        itemColor: t.textTertiary,
        lastItemColor: t.textSecondary,
        separatorColor: t.textTertiary,
        separatorMargin: 6,
      },
    },
  };
}
