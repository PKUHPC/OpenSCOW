import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncClientCall, ensureNotUndefined, RequiredBy } from "@ddadaal/tsgrpc-utils";
import { authenticate } from "src/auth/server";
import { Account, AccountServiceClient, GetAccountsRequest } from "src/generated/server/account";
import { TenantRole } from "src/models/User";
import { getClient } from "src/utils/client";

export type AdminAccountInfo = RequiredBy<Account, "balance">;

export interface GetAccountsSchema {
  method: "GET";

  responses: {
    200: {
      results: AdminAccountInfo[];
    }
  }
}

export async function getAccounts(req: GetAccountsRequest) {
  const uaClient = getClient(AccountServiceClient);

  const { results } = await asyncClientCall(uaClient, "getAccounts", req);

  return results.map((x) => ensureNotUndefined(x, ["balance"]));
}

const auth = authenticate((info) => info.tenantRoles.includes(TenantRole.TENANT_ADMIN));

export default route<GetAccountsSchema>("GetAccountsSchema",
  async (req, res) => {

    const info = await auth(req, res);
    if (!info) {
      return;
    }

    const results = await getAccounts({ tenantName: info.tenant });

    return { 200: { results } };
  });
