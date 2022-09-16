import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncClientCall } from "@ddadaal/tsgrpc-client";
import { authenticate } from "src/auth/server";
import type { GetUserStatusReply } from "src/generated/server/user";
import { UserServiceClient } from "src/generated/server/user";
import { getClient } from "src/utils/client";

export interface GetUserStatusSchema {

  method: "GET";

  responses: {
    200: GetUserStatusReply;
  }
}

export const getUserStatus = async (userId: string, tenant: string) => {

  const client = getClient(UserServiceClient);

  return await asyncClientCall(client, "getUserStatus", {
    tenantName: tenant,
    userId,
  });
};

export default route<GetUserStatusSchema>("GetUserStatusSchema", async (req, res) => {
  const auth = authenticate((i) => i.accountAffiliations.length > 0);

  const info = await auth(req, res);

  if (!info) { return; }

  const result = await getUserStatus(info.identityId, info.tenant);

  return {
    200: result,
  };
});
