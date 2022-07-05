import { jsonFetch } from "@ddadaal/next-typed-api-routes-runtime/lib/client";
import os from "os";
import path from "path";
import { USE_MOCK } from "src/apis/useMock";
import { UserInfo } from "src/models/User";
import { runtimeConfig } from "src/utils/config";

interface AuthValidateTokenSchema {
  query: { token: string }
  responses: {
    200: UserInfo;
    400: { code: "INVALID_TOKEN" };
  }
}

export async function validateToken(token: string | undefined): Promise<UserInfo | undefined> {

  if (process.env.NODE_ENV === "test" || USE_MOCK) {
    return { identityId: runtimeConfig.MOCK_USER_ID || os.userInfo().username };
  }

  if (!token) { return undefined;}

  const resp = await jsonFetch<AuthValidateTokenSchema>({
    method: "GET",
    path: path.join(runtimeConfig.AUTH_INTERNAL_URL, "/validateToken"),
    query: { token },
  }).catch(() => undefined);

  if (!resp) {
    return undefined;
  }

  return {
    identityId: resp.identityId,
  };

}

