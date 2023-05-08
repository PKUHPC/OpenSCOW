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

import { asyncUnaryCall } from "@ddadaal/tsgrpc-client";
import { status } from "@grpc/grpc-js";
import { JobServiceClient } from "@scow/protos/build/portal/job";
import { authenticate } from "src/auth/server";
import { getClient } from "src/utils/client";
import { route } from "src/utils/route";
import { handlegRPCError } from "src/utils/server";

export interface SubmitJobInfo {
  cluster: string;
  partition: string;
  nodeCount: number;
  coreCount: number;
  gpuCount?: number;
  command: string;
  jobName: string;
  qos: string | undefined;
  maxTime: number;
  account: string;
  workingDirectory: string;
  output: string;
  errorOutput: string;
  memory?: string;
  comment?: string;
  save: boolean;
}

export interface SubmitJobSchema {

  method: "POST";

  body: SubmitJobInfo;

  responses: {
    201: {
      jobId: number;
    }

    400: {
      message: string;
    }

    500: {
      code: "SCHEDULER_FAILED";
      message: string;
    }
   }
}

const auth = authenticate(() => true);

export default route<SubmitJobSchema>("SubmitJobSchema", async (req, res) => {



  const info = await auth(req, res);

  if (!info) { return; }

  const { cluster, command, jobName, coreCount, gpuCount, maxTime, save,
    nodeCount, partition, qos, account, comment, workingDirectory, output, errorOutput, memory } = req.body;

  const client = getClient(JobServiceClient);

  return await asyncUnaryCall(client, "submitJob", {
    cluster, userId: info.identityId,
    jobName,
    coreCount,
    gpuCount,
    maxTime,
    nodeCount,
    partition,
    qos,
    account,
    command,
    memory,
    comment,
    workingDirectory,
    output,
    errorOutput,
    saveAsTemplate: save,
  })
    .then(({ jobId }) => ({ 201: { jobId } } as const))
    .catch(handlegRPCError({
      [status.INTERNAL]: (err) => ({ 500: { code: "SCHEDULER_FAILED", message: err.details } } as const),
    }));
});
