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

import { typeboxRoute, typeboxRouteSchema } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncClientCall } from "@ddadaal/tsgrpc-client";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { JobChargeLimitServiceClient } from "@scow/protos/build/server/job_charge_limit";
import { Type } from "@sinclair/typebox";
import { authenticate } from "src/auth/server";
import { TenantRole, UserRole } from "src/models/User";
import { getClient } from "src/utils/client";
import { handlegRPCError } from "src/utils/server";

export const CancelJobChargeLimitSchema = typeboxRouteSchema({
  method: "DELETE",

  query: Type.Object({
    accountName: Type.String(),
    userId: Type.String(),
  }),

  responses: {
    204: Type.Null(),
    // 用户不存在，或者用户没有设置限制
    404: Type.Null(),
  },
});

export default typeboxRoute(CancelJobChargeLimitSchema, async (req, res) => {

  const { accountName, userId } = req.query;

  const auth = authenticate((u) => u.accountAffiliations.some((x) =>
    x.accountName === accountName && x.role !== UserRole.USER) || 
    u.tenantRoles.includes(TenantRole.TENANT_ADMIN));

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
