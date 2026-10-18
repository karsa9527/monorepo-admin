/** mock 接口返回体，与后端约定保持一致 */
export interface MockResult<T = unknown> {
  code: number;
  data: T;
  message: string;
}

export interface MockRequest {
  body: Record<string, unknown>;
  query: Record<string, string>;
  headers: Record<string, string>;
}

export type MockHandler = (req: MockRequest) => unknown | Promise<unknown>;

export interface MockRoute {
  method: string;
  url: string;
  handler: MockHandler;
  /** 模拟网络延迟 */
  delay?: number;
}
