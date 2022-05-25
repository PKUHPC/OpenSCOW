import { jsonFetch } from "@ddadaal/next-typed-api-routes-runtime/lib/client";
import { asyncClientCall } from "@ddadaal/tsgrpc-utils";
import path from "path";
import { MOCK_USER_INFO } from "src/apis/api.mock";
import { USE_MOCK } from "src/apis/useMock";
import { GetUserInfoReply,UserServiceClient } from "src/generated/server/user";
import { UserInfo } from "src/models/User";
import { getClient } from "src/utils/client";
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

  const client = getClient(UserServiceClient);

  const userInfo: GetUserInfoReply = await asyncClientCall(client, "getUserInfo", {
    userId: resp.identityId,
  });

  return {
    accountAffiliations: userInfo.affiliations,
    identityId: resp.identityId,
    name: userInfo.name,
    platformRoles: userInfo.platformRoles,
    tenant: userInfo.tenantName,
    tenantRoles: userInfo.tenantRoles,
  };

}

