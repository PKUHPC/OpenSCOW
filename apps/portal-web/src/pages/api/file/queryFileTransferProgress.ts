/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * OpenSCOW is licensed under Mulan PSL v2.
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
import { getClient } from "src/utils/client";
import { route } from "src/utils/route";
import { handlegRPCError } from "src/utils/server";

export const TransferInfo = Type.Object({
  toCluster: Type.String(),
  filePath: Type.String(),
  transferSizeKb: Type.Number(),
  progress: Type.Number(),
  speedKBps: Type.Number(),
  remainingTimeSeconds: Type.Number(),
});


export const QueryFileTransferProgressSchema = typeboxRouteSchema({
  method: "GET",

  query: Type.Object({
    cluster: Type.String(),
  }),

  responses: {
    200: Type.Object({ result: Type.Array(TransferInfo) }),
    400: Type.Object({ code: Type.Literal("INVALID_CLUSTER") }),
    415: Type.Object({ code: Type.Literal("SCOW_SYNC_QUERY_CMD_FAILED") }),
  },
});

const auth = authenticate(() => true);

export default route(QueryFileTransferProgressSchema, async (req, res) => {

  const info = await auth(req, res);

  if (!info) { return; }

  const { cluster } = req.query;

  const client = getClient(FileServiceClient);
  return asyncUnaryCall(client, "queryFileTransfer", {
    cluster, userId: info.identityId,
  }).then((results) => ({ 200: { result: results.transferInfos } }), handlegRPCError({
    [status.NOT_FOUND]: () => ({ 400: { code: "INVALID_CLUSTER" as const } }),
    [status.INTERNAL]: () => ({ 415: { code: "SCOW_SYNC_QUERY_CMD_FAILED" as const } }),
  }));
});
