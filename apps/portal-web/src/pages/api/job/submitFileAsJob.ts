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
import { JobServiceClient } from "@scow/protos/build/portal/job";
import { Type } from "@sinclair/typebox";
import { authenticate } from "src/auth/server";
import { OperationResult, OperationType } from "src/models/operationLog";
import { callLog } from "src/server/operationLog";
import { getClient } from "src/utils/client";
import { route } from "src/utils/route";
import { handlegRPCError, parseIp } from "src/utils/server";

export const SubmitFileAsJobSchema = typeboxRouteSchema({
  method: "POST",

  body: Type.Object({
    cluster: Type.String(),
    // 文件绝对路径
    fileDirectory: Type.String(),
  }),

  responses: {
    201: Type.Object({
      jobId: Type.Number(),
    }),

    400: Type.Object({
      message: Type.String(),
    }),

    500: Type.Object({
      code: Type.Literal("SCHEDULER_FAILED"),
      message: Type.String(),
    }),
  },
});

const auth = authenticate(() => true);

export default route(SubmitFileAsJobSchema, async (req, res) => {

  const info = await auth(req, res);

  if (!info) { return; }

  const { cluster, fileDirectory } = req.body;

  const client = getClient(JobServiceClient);

  // TODO: log确认
  // const logInfo = {
  //   operatorUserId: info.identityId,
  //   operatorIp: parseIp(req) ?? "",
  //   operationTypePayload:{
  //     accountName: account,
  //   },
  // };

  return await asyncUnaryCall(client, "submitFileAsJob", {
    cluster, userId: info.identityId, fileDirectory
    ,
  })
    .then(async ({ jobId }) => {
      // TODO: log确认
      // await callLog(
      //   { ...logInfo,
      //     operationTypeName: OperationType.submitJob,
      //     operationTypePayload: { ... logInfo.operationTypePayload, jobId } },
      //   OperationResult.SUCCESS,
      // );
      // if (save) {
      //   await callLog(
      //     {
      //       ...logInfo,
      //       operationTypeName: OperationType.addJobTemplate,
      //       operationTypePayload: { ... logInfo.operationTypePayload, jobTemplateId: `${jobName}-${jobId}` },
      //     },
      //     OperationResult.SUCCESS,
      //   );
      // }
      return { 201: { jobId } } as const;
    })
    .catch(handlegRPCError({
      [status.INTERNAL]: (err) => ({ 500: { code: "SCHEDULER_FAILED", message: err.details } } as const),
    }));
  // async () => await callLog(
  //   { ...logInfo,
  //     operationTypeName: OperationType.submitJob,
  //     operationTypePayload: { ... logInfo.operationTypePayload, jobId: -1 },
  //   },
  //   OperationResult.FAIL,
  // )));
});
