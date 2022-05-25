import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncClientCall } from "@ddadaal/tsgrpc-utils";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { authenticate } from "src/auth/server";
import { JobChargeLimitServiceClient } from "src/generated/server/jobChargeLimit";
import { UserRole } from "src/models/User";
import { getClient } from "src/utils/client";
import { handlegRPCError } from "src/utils/server";

export interface CancelJobChargeLimitSchema {
  method: "DELETE",

  body: {
    accountName: string;
    userId: string;
  }

  responses: {
    204: null;
    // 用户不存在，或者用户没有设置限制
    404: null;
  }
}

export default /* #__PURE__*/route<CancelJobChargeLimitSchema>("CancelJobChargeLimitSchema", async (req, res) => {

  const { accountName, userId } = req.body;

  const auth = authenticate((u) => u.accountAffiliations.some((x) =>
    x.accountName === accountName && x.role !== UserRole.USER));

  const info = await auth(req, res);

  if (!info) { return; }

  const client = getClient(JobChargeLimitServiceClient);

  return await asyncClientCall(client, "cancelJobChargeLimit", {
    tenantName: info.tenant,
    accountName, userId,
  })
    .then(() => ({ 204: null }))
    .catch(handlegRPCError({
      [Status.NOT_FOUND]: () => ({ 404: null }),
    }));
});
