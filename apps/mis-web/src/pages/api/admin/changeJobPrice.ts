import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncClientCall } from "@ddadaal/tsgrpc-utils";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { numberToMoney } from "@scow/lib-decimal";
import { authenticate } from "src/auth/server";
import { JobServiceClient } from "src/generated/server/job";
import { PlatformRole, TenantRole } from "src/models/User";
import type { GetJobFilter } from "src/pages/api/job/jobInfo";
import { getClient } from "src/utils/client";
import { handlegRPCError, parseIp } from "src/utils/server";

export interface ChangeJobPriceSchema {
  method: "PATCH";

  body: GetJobFilter & {

    reason: string;

    /**
     * @minimum 0
     */
    price: number;

    /** which price to change */
    target: "tenant" | "account";
  }

  responses: {
    200: { count: number };
    /** 作业未找到 */
    404: null;
    /** 非租户管理员不能修改作业的账户价格；非平台管理员不能修改作业的租户价格 */
    403: null;
  }
}

const auth = authenticate((info) =>
  info.tenantRoles.includes(TenantRole.TENANT_ADMIN)
  || info.platformRoles.includes(PlatformRole.PLATFORM_ADMIN),
);

export default route<ChangeJobPriceSchema>("ChangeJobPriceSchema",
  async (req, res) => {

    const info = await auth(req, res);
    if (!info) { return; }

    const { price, reason, accountName, clusters, jobEndTimeEnd, jobEndTimeStart, jobId, userId, target } = req.body;

    if (
      (target === "account" && !info.tenantRoles.includes(TenantRole.TENANT_ADMIN)) ||
      (target === "tenant" && !info.platformRoles.includes(PlatformRole.PLATFORM_ADMIN))
    ) {
      return { 403: null };
    }

    const client = getClient(JobServiceClient);

    const money = numberToMoney(price);

    return await asyncClientCall(client, "changeJobPrice", {
      filter: {
        tenantName: info.tenant,
        clusters: clusters ?? [],
        accountName,
        jobEndTimeEnd,
        jobEndTimeStart,
        jobId,
        userId,
      },
      ...target === "account"
        ? { accountPrice: money }
        : { tenantPrice: money },
      ipAddress: parseIp(req) ?? "",
      operatorId: info.identityId,
      reason,
    })
      .then((x) => ({ 200: x }))
      .catch(handlegRPCError({
        [Status.NOT_FOUND]: () => ({ 404: null }),
      }));
  });
