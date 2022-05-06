import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncClientCall } from "@ddadaal/tsgrpc-utils";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { numberToMoney } from "@scow/lib-decimal";
import { authenticate } from "src/auth/server";
import { JobChargeLimitServiceClient } from "src/generated/server/jobChargeLimit";
import { UserRole } from "src/models/User";
import { getClient } from "src/utils/client";
import { handlegRPCError } from "src/utils/server";

export interface SetJobChargeLimitSchema {
  method: "PUT",

  body: {
    accountName: string;
    userId: string;
    limit: number;
  }

  responses: {
    204: null;
    // 用户不存在
    404: null;
  }
}

export default /*#__PURE__*/route<SetJobChargeLimitSchema>("SetJobChargeLimitSchema", async (req, res) => {

  const { accountName, userId, limit } = req.body;

  const auth = authenticate((u) => u.accountAffiliations.some((x) =>
    x.accountName === accountName && x.role !== UserRole.USER));

  const info = await auth(req, res);

  if (!info) { return; }

  const client = getClient(JobChargeLimitServiceClient);

  return await asyncClientCall(client, "setJobChargeLimit", {
    tenantName: info.tenant,
    accountName, userId, limit: numberToMoney(limit),
  })
    .then(() => ({ 204: null }))
    .catch(handlegRPCError({
      [Status.NOT_FOUND]: () => ({ 404: null }),
    }));
});
