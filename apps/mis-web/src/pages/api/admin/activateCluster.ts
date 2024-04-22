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
import { ConfigServiceClient } from "@scow/protos/build/server/config";
import { Type } from "@sinclair/typebox";
import { authenticate } from "src/auth/server";
import { ClusterOnlineInfoSchema } from "src/models/cluster";
import { OperationResult, OperationType } from "src/models/operationLog";
import { PlatformRole } from "src/models/User";
import { callLog } from "src/server/operationLog";
import { getClient } from "src/utils/client";
import { route } from "src/utils/route";
import { handlegRPCError, parseIp } from "src/utils/server";

export const ActivateClusterSchema = typeboxRouteSchema({
  method: "PUT",

  body: Type.Object({
    clusterId: Type.String(),
    comment: Type.Optional(Type.String()),
  }),

  responses: {
    // 如果当前集群无法连接或者已经上线了，那么executed为false
    200: Type.Object({
      executed: Type.Boolean(),
      reason: Type.Optional(Type.String()),
      currentOnlineClusters: Type.Optional(Type.Array(ClusterOnlineInfoSchema)),
    }),
    // 集群不存在
    404: Type.Null(),
  },
});

export default /* #__PURE__*/route(ActivateClusterSchema, async (req, res) => {
  const { clusterId, comment } = req.body;

  const auth = authenticate((u) => u.platformRoles.includes(PlatformRole.PLATFORM_ADMIN));

  const info = await auth(req, res);

  if (!info) { return; }


  const client = getClient(ConfigServiceClient);

  const logInfo = {
    operatorUserId: info.identityId,
    operatorIp: parseIp(req) ?? "",
    operationTypeName: OperationType.activateCluster,
    operationTypePayload:{
      userId: info.identityId, clusterId,
    },
  };

  return await asyncClientCall(client, "activateCluster", {
    clusterId,
    comment,
    operatorId: info.identityId,
  })
    .then(async (reply) => {
      await callLog(logInfo, OperationResult.SUCCESS);
      return { 200: { executed: true, currentOnlineClusters: reply.currentOnlineClusters } };
    })
    .catch(handlegRPCError({
      [Status.NOT_FOUND]: () => ({ 404: null }),
      [Status.UNIMPLEMENTED]: (e) => ({ 200: { executed: false, reason: e.details } }),
      [Status.ALREADY_EXISTS]: (e) => ({ 200: { executed: false, reason: e.details } }),
    },
    async () => await callLog(logInfo, OperationResult.FAIL),
    ));
});
