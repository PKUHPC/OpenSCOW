import { asyncUnaryCall } from "@ddadaal/tsgrpc-client";
import { authenticate } from "src/auth/server";
import { JobServiceClient } from "src/generated/portal/job";
import { getClient } from "src/utils/client";
import { route } from "src/utils/route";

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

  const client = getClient(JobServiceClient);

  return asyncUnaryCall(client, "listAccounts", {
    cluster, userId: info.identityId,
  }).then(({ accounts }) => ({ 200: { accounts } }));

});
