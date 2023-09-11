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

import { typeboxRouteSchema } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncClientCall } from "@ddadaal/tsgrpc-client";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { AccountServiceClient, BlockAccountResponse_Result } from "@scow/protos/build/server/account";
import { Type } from "@sinclair/typebox";
import { authenticate } from "src/auth/server";
import { OperationResult, OperationType } from "src/models/operationLog";
import { PlatformRole, TenantRole, UserRole } from "src/models/User";
import { callLog } from "src/server/operationLog";
import { getClient } from "src/utils/client";
import { route } from "src/utils/route";
import { handlegRPCError, parseIp } from "src/utils/server";


export const BlockAccountTexts = {
  1: "账户已经被封锁",
  2: "账户在白名单内，请移出白名单后再封锁",
};

export const BlockAccountSchema = typeboxRouteSchema({
  method: "PUT",

  body: Type.Object({
    accountName: Type.String(),
    tenantName: Type.String(),
  }),

  responses: {
    // 如果账户已经block，那么executed为false
    200: Type.Object({
      executed: Type.Boolean(),
      reason: Type.Optional(Type.String()),
    }),
  },
});

export default /* #__PURE__*/route(BlockAccountSchema, async (req, res) => {
  const { tenantName, accountName } = req.body;


  const auth = authenticate((u) => {
    const acccountBelonged = u.accountAffiliations.find((x) => x.accountName === accountName);

    return u.platformRoles.includes(PlatformRole.PLATFORM_ADMIN) ||
          (acccountBelonged && acccountBelonged.role !== UserRole.USER) ||
          u.tenantRoles.includes(TenantRole.TENANT_ADMIN);
  });

  const info = await auth(req, res);

  if (!info) { return; }


  const client = getClient(AccountServiceClient);

  const logInfo = {
    operatorUserId: info.identityId,
    operatorIp: parseIp(req) ?? "",
    operationTypeName: OperationType.blockAccount,
    operationTypePayload:{
      tenantName, accountName, userId: info.identityId,
    },
  };

  return await asyncClientCall(client, "blockAccount", {
    tenantName,
    accountName,
  })
    .then(async (res) => {
      if (res.result === BlockAccountResponse_Result.OK) {
        await callLog(logInfo, OperationResult.SUCCESS);
        return { 200: {
          executed: true,
        } };
      } else {
        await callLog(logInfo, OperationResult.FAIL);
        return { 200: {
          executed: false,
          reason: BlockAccountTexts[res.result],
        } };
      }

    })
    .catch(handlegRPCError({
      [Status.NOT_FOUND]: (e) => ({ 200: { executed: false, reason: e.details } }),
      [Status.INTERNAL]: (e) => ({ 200: { executed: false, reason: e.details } }),
    },
    async () => await callLog(logInfo, OperationResult.FAIL),
    ));
});
