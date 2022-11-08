import { asyncClientCall } from "@ddadaal/tsgrpc-client";
import { validateToken as valToken } from "@scow/lib-auth";
import { MOCK_USER_INFO } from "src/apis/api.mock";
import { USE_MOCK } from "src/apis/useMock";
import { GetUserInfoReply, UserServiceClient } from "src/generated/server/user";
import { UserInfo } from "src/models/User";
import { getClient } from "src/utils/client";
import { runtimeConfig } from "src/utils/config";


export async function validateToken(token: string): Promise<UserInfo | undefined> {

  if (USE_MOCK) {
    return MOCK_USER_INFO;
  }

  const resp = await valToken(runtimeConfig.AUTH_INTERNAL_URL, token).catch(() => undefined);


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

