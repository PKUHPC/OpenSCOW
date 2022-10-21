import { asyncUnaryCall } from "@ddadaal/tsgrpc-client";
import { status } from "@grpc/grpc-js";
import { authenticate } from "src/auth/server";
import { JobServiceClient } from "src/generated/portal/job";
import { getClient } from "src/utils/client";
import { route } from "src/utils/route";
import { handlegRPCError } from "src/utils/server";

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

  return await asyncUnaryCall(client, "submitJob", {
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
  }).then(({ jobId }) => ({ 201: { jobId } }), handlegRPCError({
    [status.INTERNAL]: (e) => ({ 409: { code: "SBATCH_FAILED" as const, message: e.details } }),
  }));
});
