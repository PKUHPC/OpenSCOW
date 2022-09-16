import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncClientCall } from "@ddadaal/tsgrpc-client";
import { authenticate } from "src/auth/server";
import { Money } from "src/generated/common/money";
import { AccountServiceClient, GetAccountsRequest } from "src/generated/server/account";
import { TenantRole } from "src/models/User";
import { ensureNotUndefined } from "src/utils/checkNull";
import { getClient } from "src/utils/client";

export type AdminAccountInfo = {
  tenantName: string;
  accountName: string;
  userCount: number;
  blocked: boolean;
  ownerId: string;
  ownerName: string;
  comment: string;
  balance: Money;
}

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
