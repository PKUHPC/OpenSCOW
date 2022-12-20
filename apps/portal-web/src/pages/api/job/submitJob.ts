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
import { JobServiceClient } from "@scow/protos/build/portal/job";
import { authenticate } from "src/auth/server";
import { ensureNotUndefined } from "src/utils/checkNull";
import { getClient } from "src/utils/client";
import { route } from "src/utils/route";

export interface SubmitJobInfo {
  cluster: string;
  partition: string | undefined;
  nodeCount: number;
  coreCount: number;
  command: string;
  jobName: string;
  qos: string | undefined;
  maxTime: number;
  account: string;
  workingDirectory: string;
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

    409: {
      code: "SBATCH_FAILED" | "ALREADY_EXISTS";
      message: string;
    }
   }
}

const auth = authenticate(() => true);

export default route<SubmitJobSchema>("SubmitJobSchema", async (req, res) => {



  const info = await auth(req, res);

  if (!info) { return; }

  const { cluster, command, jobName, coreCount, maxTime, save,
    nodeCount, partition, qos, account, comment, workingDirectory } = req.body;

  const client = getClient(JobServiceClient);

  const resp = await asyncUnaryCall(client, "submitJob", {
    cluster, userId: info.identityId,
    jobName,
    coreCount,
    maxTime,
    nodeCount,
    partition,
    qos,
    account,
    command,
    comment,
    workingDirectory,
    saveAsTemplate: save,
  });

  const { result } = ensureNotUndefined(resp, ["result"]);

  if (result.$case === "error") {
    return { 409: { code: "SBATCH_FAILED", message: result.error.error } };
  }

  return { 201: { jobId: result.ok.jobId } };
});
