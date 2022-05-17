import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncClientCall } from "@ddadaal/tsgrpc-utils";
import { status } from "@grpc/grpc-js";
import { authenticate } from "src/auth/server";
import { JobServiceClient } from "src/generated/portal/job";
import { getJobServerClient } from "src/utils/client";

export interface SubmitJobInfo {
  cluster: string;
  command: string;
  jobName: string;
}

export interface SubmitJobSchema {

  method: "POST";

  body: SubmitJobInfo;

  responses: {
    201: {
      jobId: number;
    }

    409: {
      result: "SBATCH_FAILED" | "ALREADY_EXISTS";
      message: string;
    }
   }
}

const auth = authenticate(() => true);

export default route<SubmitJobSchema>("SubmitJobSchema", async (req, res) => {

  const info = await auth(req, res);

  if (!info) { return; }

  const { cluster, command, jobName } = req.body;

  const client = getJobServerClient(JobServiceClient);

  return await asyncClientCall(client, "submitJob", {
    cluster,
    userId: info.identityId,
    command: command,
    jobName: jobName,
  })
    .then(({ jobId }) => ({ 201: { jobId } }))
    .catch((e) => {
      if (e.code === status.UNAVAILABLE) {
        return { 409: { result: "SBATCH_FAILED", message: e.details } } as const;
      } else if (e.code === status.ALREADY_EXISTS) {
        return { 409: { result: "ALREADY_EXISTS", message: e.message } } as const;
      } else {
        throw e;
      }
    });
});
