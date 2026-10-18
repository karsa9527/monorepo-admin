import { makeAutoObservable, runInAction } from 'mobx';
import type { RootStore } from './index';
import { authService } from '@/pages/(auth)/login/service';
import type { LoginParams, UserInfo } from '@/types';
import { tokenStorage } from '@office/lib';
import { ERROR_CODE_UNAUTHORIZED, RequestError } from '@office/lib/request';

/** 认证 store：token、用户信息、登录 / 登出 / 恢复登录态 */
export class AuthStore {
  root: RootStore;

  token = tokenStorage.get() ?? '';
  refreshToken = tokenStorage.getRefresh() ?? '';
  userInfo: UserInfo | null = null;

  /** 登录按钮 loading */
  submitting = false;
  /** 拉取用户信息中 */
  loadingInfo = false;
  /** 已完成初始化（用于首屏路由守卫等待） */
  initialized = false;
  /** 最近一次失败原因 */
  errorMsg = '';
  /** bootstrap 单飞任务：StrictMode 双调用时共用一个请求，避免并发与被去重取消 */
  bootstrapTask: Promise<void> | null = null;

  constructor(root: RootStore) {
    this.root = root;
    makeAutoObservable(this, { root: false, bootstrapTask: false }, { autoBind: true });
  }

  get isLogin(): boolean {
    return Boolean(this.token);
  }

  get userId(): number | undefined {
    return this.userInfo?.id;
  }

  get nickname(): string {
    return this.userInfo?.nickname || this.userInfo?.username || '未登录';
  }

  get avatar(): string {
    return this.userInfo?.avatar || '';
  }

  setToken(token: string, refreshToken?: string) {
    this.token = token;
    tokenStorage.set(token);
    if (refreshToken !== undefined) {
      this.refreshToken = refreshToken;
      tokenStorage.setRefresh(refreshToken);
    }
  }

  /** 登录：拿 token -> 拉用户信息 -> 写入权限 */
  async login(params: LoginParams): Promise<UserInfo> {
    this.submitting = true;
    this.errorMsg = '';
    try {
      const { token, refreshToken } = await authService.login(params);
      this.setToken(token, refreshToken);
      const user = await this.fetchUserInfo();
      return user;
    } catch (err) {
      this.errorMsg = err instanceof Error ? err.message : '登录失败';
      throw err;
    } finally {
      runInAction(() => {
        this.submitting = false;
      });
    }
  }

  /** 拉取用户信息并同步权限 store */
  async fetchUserInfo(): Promise<UserInfo> {
    this.loadingInfo = true;
    try {
      const user = await authService.getUserInfo();
      runInAction(() => {
        this.userInfo = user;
      });
      this.root.permission.setPermissions(user.permissions ?? []);
      this.root.permission.setRoles(user.roles ?? []);
      return user;
    } catch (err) {
      // 401 说明 token 失效，直接清空登录态交给守卫处理
      if (err instanceof RequestError && err.code === ERROR_CODE_UNAUTHORIZED) {
        this.clearAuth();
      }
      throw err;
    } finally {
      runInAction(() => {
        this.loadingInfo = false;
      });
    }
  }

  /**
   * 应用启动时恢复登录态
   *
   * 单飞：并发调用（如 React StrictMode 双执行 effect）复用同一个任务，
   * 避免两次请求被去重逻辑取消、进而误清空登录态。
   */
  async bootstrap(): Promise<void> {
    if (!this.bootstrapTask) {
      this.bootstrapTask = this.resolveSession();
    }
    await this.bootstrapTask;
  }

  /** 真正的恢复逻辑，只执行一次 */
  private async resolveSession(): Promise<void> {
    try {
      if (this.token) {
        await this.fetchUserInfo();
      }
    } catch (err) {
      // 主动取消不代表登录态失效，不能清 token
      const isCanceled = err instanceof RequestError && err.isCancel;
      if (!isCanceled) this.clearAuth();
    } finally {
      runInAction(() => {
        this.initialized = true;
      });
    }
  }

  /** 登出：调用后端 + 清理本地 */
  async logout(silent = false): Promise<void> {
    try {
      if (!silent && this.isLogin) {
        await authService.logout();
      }
    } catch {
      /* 登出接口失败也要清理本地态 */
    } finally {
      this.clearAuth();
    }
  }

  /** 仅清理本地登录态 */
  clearAuth() {
    this.token = '';
    this.refreshToken = '';
    this.userInfo = null;
    tokenStorage.clear();
    this.root.permission.reset();
  }
}
