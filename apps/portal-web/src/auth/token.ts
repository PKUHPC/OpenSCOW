import { jsonFetch } from "@ddadaal/next-typed-api-routes-runtime/lib/client";
import path from "path";
import { MOCK_USER_INFO } from "src/apis/api.mock";
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

export async function validateToken(token: string): Promise<UserInfo | undefined> {

  if (USE_MOCK) {
    return MOCK_USER_INFO;
  }

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

