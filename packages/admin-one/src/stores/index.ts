import { createContext, useContext, type ReactNode } from 'react';
import { AuthStore } from './auth';
import { PermissionStore } from './permission';
import { AppStore } from './app';

/**
 * 根 store：聚合所有子 store
 * 子 store 通过 root 互相访问（如 auth -> permission）
 */
export class RootStore {
  auth: AuthStore;
  permission: PermissionStore;
  app: AppStore;

  constructor() {
    this.auth = new AuthStore(this);
    this.permission = new PermissionStore(this);
    this.app = new AppStore(this);
  }
}

const StoreContext = createContext<RootStore | null>(null);

export function createRootStore(): RootStore {
  return new RootStore();
}

export const StoreProvider = StoreContext.Provider;

/** 获取根 store */
export function useStores(): RootStore {
  const store = useContext(StoreContext);
  if (!store) {
    throw new Error('useStores 必须在 <StoreProvider> 内部使用');
  }
  return store;
}

/** 常用子 store 快捷访问 */
export const useAuthStore = () => useStores().auth;
export const usePermissionStore = () => useStores().permission;
export const useAppStore = () => useStores().app;

export interface StoreProviderProps {
  store?: RootStore;
  children: ReactNode;
}

export { AuthStore, PermissionStore, AppStore };
