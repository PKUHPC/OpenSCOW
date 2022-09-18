import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncClientCall } from "@ddadaal/tsgrpc-client";
import { Account, AccountServiceClient } from "src/generated/server/account";
import { getClient } from "src/utils/client";
import { DEFAULT_TENANT_NAME } from "src/utils/constants";
import { queryIfInitialized } from "src/utils/init";

export interface InitGetAccountsSchema {
  method: "GET";

  responses: {
    200: {
      accounts: Account[];
    }

    409: { code: "ALREADY_INITIALIZED"; }
  }
}

export default route<InitGetAccountsSchema>("InitGetAccountsSchema", async () => {

  const result = await queryIfInitialized();

  if (result) { return { 409: { code: "ALREADY_INITIALIZED" } }; }

  const client = getClient(AccountServiceClient);

  const reply = await asyncClientCall(client, "getAccounts", {
    tenantName: DEFAULT_TENANT_NAME,
  });

  return {
    200: {
      accounts: reply.results,
    },
  };

});
