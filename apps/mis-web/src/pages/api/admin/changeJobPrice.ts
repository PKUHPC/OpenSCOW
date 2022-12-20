/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * SCOW is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import { asyncClientCall } from "@ddadaal/tsgrpc-client";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { numberToMoney } from "@scow/lib-decimal";
import { JobServiceClient } from "@scow/protos/build/server/job";
import { authenticate } from "src/auth/server";
import { PlatformRole, TenantRole } from "src/models/User";
import type { GetJobFilter } from "src/pages/api/job/jobInfo";
import { getClient } from "src/utils/client";
import { route } from "src/utils/route";
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
      ...(target === "account" ? { accountPrice: money } : { tenantPrice: money }),
      ipAddress: parseIp(req) ?? "",
      operatorId: info.identityId,
      reason,
    })
      .then((x) => ({ 200: x }))
      .catch(handlegRPCError({
        [Status.NOT_FOUND]: () => ({ 404: null }),
      }));
  });
