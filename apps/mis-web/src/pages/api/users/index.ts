import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncClientCall } from "@ddadaal/tsgrpc-utils";
import { authenticate } from "src/auth/server";
import type { AccountUserInfo } from "src/generated/server/user";
import { UserServiceClient } from "src/generated/server/user";
import { PlatformRole, UserRole } from "src/models/User";
import { getClient } from "src/utils/client";

export interface GetAccountUsersSchema {
  method: "GET";

  query: {
    accountName: string;
  }

  responses: {
    200: {
      results: AccountUserInfo[];
    }
  }
}

export default route<GetAccountUsersSchema>("GetAccountUsersSchema", async (req, res) => {

  const { accountName } = req.query;

  const auth = authenticate((u) =>
    u.platformRoles.includes(PlatformRole.PLATFORM_ADMIN) ||
    u.accountAffiliations.find((x) => x.accountName === accountName)?.role !== UserRole.USER);

  const info = await auth(req, res);

  if (!info) { return; }

  const client = getClient(UserServiceClient);

  const reply = await asyncClientCall(client, "getAccountUsers", {
    tenantName: info.tenant,
    accountName,
  });

  return {
    200: {
      results: reply.results,
    },
  };

});
