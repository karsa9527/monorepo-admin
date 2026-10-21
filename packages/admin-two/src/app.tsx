import { useEffect, useMemo, type ReactNode } from 'react';
import { App as AntdApp, ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { RouterProvider } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { useAppStore, useAuthStore, useStores } from '@/stores';
import { setupRequestHooks } from '@office-admin/lib/request';
import type { AppRouter } from '@office-admin/lib/router';
import { createAntdTheme } from '@/theme';

export type { AppRouter };

interface AppProps {
  router: AppRouter;
}

/** 把请求库的钩子与 antd message / 路由 / store 连接起来 */
function RequestBridge({ router, children }: AppProps & { children: ReactNode }) {
  const { message } = AntdApp.useApp();
  const auth = useAuthStore();
  const app = useAppStore();

  useEffect(() => {
    setupRequestHooks({
      getToken: () => auth.token,
      onError: (error) => {
        if (error.isCancel) return;
        message.error(error.message || '请求失败');
      },
      onSuccess: (text) => message.success(text),
      onLoadingChange: (count) => app.setRequestPending(count),
      onUnauthorized: () => {
        void auth.logout(true);
        void router.navigate('/login', { replace: true });
      },
    });

    // 恢复登录态
    void auth.bootstrap();
  }, [auth, app, message, router]);

  return <>{children}</>;
}

const App = observer(({ router }: AppProps) => {
  const { app } = useStores();

  // 主题配置集中在 src/theme/antd-theme.ts：algorithm + token + components
  const themeConfig = useMemo(
    () => createAntdTheme({ mode: app.theme, primaryColor: app.primaryColor }),
    [app.theme, app.primaryColor],
  );

  return (
    <ConfigProvider locale={zhCN} theme={themeConfig}>
      <AntdApp>
        <RequestBridge router={router}>
          {/* v7_startTransition：把路由状态更新包进 React.startTransition，
              懒加载页面在导航时挂起会被当作过渡处理，不会报 suspended 错误 */}
          <RouterProvider router={router} future={{ v7_startTransition: true }} />
        </RequestBridge>
      </AntdApp>
    </ConfigProvider>
  );
});

export default App;
