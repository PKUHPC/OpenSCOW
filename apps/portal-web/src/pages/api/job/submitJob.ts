import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncClientCall } from "@ddadaal/tsgrpc-utils";
import { status } from "@grpc/grpc-js";
import { authenticate } from "src/auth/server";
import { JobServiceClient } from "src/generated/portal/job";
import { getJobServerClient } from "src/utils/client";
import { publicConfig } from "src/utils/config";

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

  const { cluster, command, jobName, coreCount, maxTime, nodeCount, partition, qos, account } = req.body;

  // validate the parameters
  if (!(cluster in publicConfig.CLUSTERS_CONFIG)) {
    return { 400: { message: `Cluster ${cluster} not exists.` } };
  }

  const client = getJobServerClient(JobServiceClient);

  const { script } = await asyncClientCall(client, "generateJobScript", {
    jobName,
    coreCount,
    maxTime,
    nodeCount,
    partition,
    qos,
    account,
    command,
  });

  return await asyncClientCall(client, "submitJob", {
    cluster,
    userId: info.identityId,
    jobName,
    script,
  })
    .then(({ jobId }) => ({ 201: { jobId } }))
    .catch((e) => {
      if (e.code === status.UNAVAILABLE) {
        return { 409: { code: "SBATCH_FAILED", message: e.details } } as const;
      } else if (e.code === status.ALREADY_EXISTS) {
        return { 409: { code: "ALREADY_EXISTS", message: e.message } } as const;
      } else {
        throw e;
      }
    });
});
