import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { mockPlugin } from '@office-admin/mock';

const STYLES_DIR = path.resolve(__dirname, './src/styles');
/** 常量 / mixin 文件本身不能再被注入，否则会自我 @use 形成循环依赖 */
const IS_BASE_STYLE = /(^|[\\/])_(config|mixins)\.scss$/;

export default defineConfig(() => {
  return {
    base: './',
    plugins: [
      react(),
      // mock 中间件来自 @office-admin/mock，多个应用共用同一份接口数据
      mockPlugin({ prefix: '/api' }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
      // 共享包以源码方式消费，避免 workspace 里出现两份 react 实例
      dedupe: ['react', 'react-dom'],
    },
    optimizeDeps: {
      // 本地 workspace 包由 Vite 直接按源码处理（自带 HMR），不预打包
      exclude: ['@office-admin/lib', '@office-admin/components'],
    },
    css: {
      preprocessorOptions: {
        scss: {
          /**
           * 全局注入编译期常量（$space-* / $radius-* / $breakpoints）与 mixin，
           * 业务 .scss 直接 @include 即可，不必每个文件写一长串 @use。
           * 只注入「不产出 CSS」的文件，所以不会造成样式重复。
           */
          additionalData: (source: string, filename: string) =>
            IS_BASE_STYLE.test(filename)
              ? source
              : `@use "${STYLES_DIR}/config" as *;\n@use "${STYLES_DIR}/mixins" as *;\n${source}`,
          // sass 1.80+ 对 legacy JS API 的提示，Vite 5 仍在用 legacy 通道
          silenceDeprecations: ['legacy-js-api'],
        },
      },
    },
    server: {
      port: 5178,
      // 两个应用端口固定，被占用时直接报错，避免静默漂移到对方的端口
      strictPort: true,
      open: false,
      proxy: {
        // 真实后端代理：未命中 mock 的请求会走这里
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: 'dist',
      target: 'es2018',
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            antd: ['antd', '@ant-design/icons'],
            vendor: ['mobx', 'mobx-react-lite', 'axios', 'dayjs'],
          },
        },
      },
    },
  };
});
