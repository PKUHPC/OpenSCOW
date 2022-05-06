import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncClientCall } from "@ddadaal/tsgrpc-utils";
import { authenticate } from "src/auth/server";
import { AccountServiceClient, WhitelistedAccount } from "src/generated/server/account";
import { TenantRole } from "src/models/User";
import { getClient } from "src/utils/client";

export interface GetWhitelistedAccountsSchema {
  method: "GET";

  responses: {
    200: {
      results: WhitelistedAccount[];
    }
  }
}

const auth = authenticate((info) => info.tenantRoles.includes(TenantRole.TENANT_ADMIN));

export default route<GetWhitelistedAccountsSchema>("GetWhitelistedAccountsSchema",
  async (req, res) => {

    const info = await auth(req, res);
    if (!info) { return; }

    const client = getClient(AccountServiceClient);

    const reply = await asyncClientCall(client, "getWhitelistedAccounts", {
      tenantName: info.tenant,
    });

    return { 200: {
      results: reply.accounts.map((x) => ({ ...x })),
    } };
  });
