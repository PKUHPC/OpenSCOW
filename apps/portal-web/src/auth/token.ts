import { jsonFetch } from "@ddadaal/next-typed-api-routes-runtime/lib/client";
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
    if (!runtimeConfig.MOCK_USER_ID) {
      throw new Error("Using mock user id but runtimeConfig.MOCK_USER_ID is not set");
    }
    return { identityId: runtimeConfig.MOCK_USER_ID };
  }

  if (!token) { return undefined; }

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

