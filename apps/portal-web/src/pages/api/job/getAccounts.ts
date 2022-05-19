import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncClientCall } from "@ddadaal/tsgrpc-utils";
import { authenticate } from "src/auth/server";
import { JobServiceClient } from "src/generated/portal/job";
import { getJobServerClient } from "src/utils/client";

export interface GetAccountsSchema {

  method: "GET";

  query: {
    cluster: string;
  }

  responses: {
    200: {
      accounts: string[];
    }
  }
}

const auth = authenticate(() => true);

export default route<GetAccountsSchema>("GetAccountsSchema", async (req, res) => {

  const info = await auth(req, res);

  if (!info) { return; }

  const { cluster } = req.query;

  const client = getJobServerClient(JobServiceClient);

  const resp = await asyncClientCall(client, "getAccounts", {
    cluster,
    userId: info.identityId,
  });

  return { 200: { accounts: resp.accounts  } };

});
