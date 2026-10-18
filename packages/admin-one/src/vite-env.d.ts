/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_REQUEST_TIMEOUT: string;
  readonly VITE_APP_TITLE: string;
  readonly VITE_USE_MOCK: string;
  readonly VITE_ROUTER_MODE: 'hash' | 'browser';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
