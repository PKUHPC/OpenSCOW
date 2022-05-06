import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncClientCall } from "@ddadaal/tsgrpc-utils";
import { authenticate } from "src/auth/server";
import { UserServiceClient } from "src/generated/server/user";
import { getClient } from "src/utils/client";

export interface QueryStorageUsageSchema {
  method: "GET";

  query: {
    cluster: string;
  }

  responses: {
    200: {
      result: number;
    };

    404: null;
  }
}

export default route<QueryStorageUsageSchema>("QueryStorageUsageSchema", async (req, res) => {

  const auth = authenticate(() => true);

  const info = await auth(req, res);

  if (!info) { return; }

  const { cluster } = req.query;

  const client = getClient(UserServiceClient);

  const reply = await asyncClientCall(client, "queryUsedStorageQuota", {
    tenantName: info.tenant,
    userId: info.identityId,
    cluster: cluster,
  });

  return {
    200: {
      result: reply.used,
    },
  };

});
