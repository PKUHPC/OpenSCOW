import { authenticate } from "src/auth/server";
import { getClusterOps } from "src/clusterops";
import { NewJobInfo } from "src/generated/portal/job";
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

  const jobInfo: NewJobInfo = {
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
  };

  const clusterops = getClusterOps(cluster);

  const scriptReply = await clusterops.job.generateJobScript({
    jobInfo,
  }, req.log);

  const reply = await clusterops.job.submitJob({
    userId: info.identityId,
    jobInfo,
    script: scriptReply.script,
    save,
  }, req.log);

  if (reply.code === "SBATCH_FAILED") {
    return { 409: { code: "SBATCH_FAILED", message: reply.message } };
  }

  return { 201: { jobId: reply.jobId } };
});
