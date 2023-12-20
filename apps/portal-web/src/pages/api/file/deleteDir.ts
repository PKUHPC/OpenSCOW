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
import { asyncUnaryCall } from "@ddadaal/tsgrpc-client";
import { status } from "@grpc/grpc-js";
import { FileServiceClient } from "@scow/protos/build/portal/file";
import { Type } from "@sinclair/typebox";
import { authenticate } from "src/auth/server";
import { OperationResult, OperationType } from "src/models/operationLog";
import { callLog } from "src/server/operationLog";
import { getClient } from "src/utils/client";
import { route } from "src/utils/route";
import { handlegRPCError, parseIp } from "src/utils/server";

export const DeleteDirSchema = typeboxRouteSchema({
  method: "DELETE",

  query: Type.Object({
    cluster: Type.String(),
    path: Type.String(),
  }),

  responses: {
    204: Type.Null(),
    400: Type.Object({ code: Type.Literal("INVALID_CLUSTER") }),
    500: Type.Object({ code: Type.Literal("CANT_DELETE") }),
  },
});

const auth = authenticate(() => true);

export default route(DeleteDirSchema, async (req, res) => {

  const info = await auth(req, res);

  if (!info) { return; }

  const { cluster, path } = req.query;

  const client = getClient(FileServiceClient);

  const logInfo = {
    operatorUserId: info.identityId,
    operatorIp: parseIp(req) ?? "",
    operationTypeName: OperationType.deleteDirectory,
    operationTypePayload: {
      clusterId: cluster, path,
    },
  };

  return asyncUnaryCall(client, "deleteDirectory", {
    cluster, path, userId: info.identityId,
  }).then(async () => {
    await callLog(logInfo, OperationResult.SUCCESS);
    return { 204: null };
  }, handlegRPCError({
    [status.NOT_FOUND]: () => ({ 400: { code: "INVALID_CLUSTER" as const } }),
    [status.INTERNAL]: () => ({ 500: { code: "CANT_DELETE" as const } }),
  },
  async () => await callLog(logInfo, OperationResult.FAIL),
  ));


});
