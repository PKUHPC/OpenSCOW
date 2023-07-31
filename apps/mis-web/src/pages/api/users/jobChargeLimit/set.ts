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
import { numberToMoney } from "@scow/lib-decimal";
import { JobChargeLimitServiceClient } from "@scow/protos/build/server/job_charge_limit";
import { OperationCode, OperationType } from "@scow/protos/build/server/operation_log";
import { Type } from "@sinclair/typebox";
import { authenticate } from "src/auth/server";
import { TenantRole, UserRole } from "src/models/User";
import { getClient } from "src/utils/client";
import { logOperation } from "src/utils/logOperation";
import { handlegRPCError, parseIp } from "src/utils/server";

export const SetJobChargeLimitSchema = typeboxRouteSchema({
  method: "PUT",

  body: Type.Object({
    accountName: Type.String(),
    userId: Type.String(),
    limit: Type.Number(),
  }),

  responses: {
    204: Type.Null(),
    // 用户不存在
    404: Type.Null(),
  },
});

export default typeboxRoute(SetJobChargeLimitSchema, async (req, res) => {

  const { accountName, userId, limit } = req.body;

  const auth = authenticate((u) => {
    const acccountBelonged = u.accountAffiliations.find((x) => x.accountName === accountName);

    return (acccountBelonged && acccountBelonged.role !== UserRole.USER) || 
          u.tenantRoles.includes(TenantRole.TENANT_ADMIN);
  });
  
  const info = await auth(req, res);

  if (!info) { return; }

  const client = getClient(JobChargeLimitServiceClient);

  const logInfo = {
    operatorUserId: info.identityId,
    operatorIp: parseIp(req) || "",
    operationCode: OperationCode.ACCOUNT_SET_CHARGE_LIMIT,
    operationType: OperationType.SET_CHARGE_LIMIT,
    operationContent: `在账户${accountName}中设置用户${userId}的限额为${limit}元`,
    operationTargetAccountName: accountName,
  };

  return await asyncClientCall(client, "setJobChargeLimit", {
    tenantName: info.tenant,
    accountName, userId, limit: numberToMoney(limit),
  })
    .then(() => {
      logOperation(logInfo, true);
      return { 204: null };
    })
    .catch(handlegRPCError({
      [Status.NOT_FOUND]: () => ({ 404: null }),
    }, () => {
      logOperation(logInfo, false);
    }));

});
