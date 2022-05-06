import { JsonFetchResultPromiseLike } from "@ddadaal/next-typed-api-routes-runtime/lib/client";
import { api } from "src/apis/api";
import { UserInfo } from "src/models/User";

export type MockApi<TApi extends Record<
  string,
 (...args: any[]) => JsonFetchResultPromiseLike<any>>
 > = { [key in keyof TApi]:
    (...args) =>
    Promise<
      ReturnType<TApi[key]> extends PromiseLike<infer TSuc>
      ? TSuc
      : never
    >
  };

export const mockApi: MockApi<typeof api> = {

  getIcon: async () => undefined,

  launchDesktop: async () => ({ node: "login01", password: "123",port: 1234 }),

  logout: async () => null,

  authCallback: async () => undefined as never,

  changePassword: async () => null,

  validateToken: async () => MOCK_USER_INFO,
};

export const MOCK_USER_INFO = {
  identityId: "123",
} as UserInfo;
