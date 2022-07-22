import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { authenticate } from "src/auth/server";
import { getClusterOps } from "src/clusterops";
import { createLogger } from "src/utils/log";

export interface CreateAppSessionSchema {
  method: "POST";

  body: {
    cluster: string;
    appId: string;
    account: string;
    partition: string | undefined;
    qos: string | undefined;
    coreCount: number;
    maxTime: number;
  }

  responses: {
    200: {
      jobId: number;
      sessionId: string;
    };

    400: {
      message: string;
    }

    409: {
      code: "SBATCH_FAILED";
      message: string;
    }

  }
}

const auth = authenticate(() => true);

export default /* #__PURE__*/route<CreateAppSessionSchema>("CreateAppSessionSchema", async (req, res) => {

  const logger = createLogger();

  const info = await auth(req, res);

  if (!info) { return; }

  const { appId, cluster, coreCount, partition, qos, account, maxTime } = req.body;

  const clusterops = getClusterOps(cluster);

  const reply = await clusterops.app.createApp({
    appId,
    userId: info.identityId,
    coreCount,
    account,
    maxTime,
    partition,
    qos,
  }, logger);

  if (reply.code === "SBATCH_FAILED") {
    return { 409: { code: "SBATCH_FAILED", message: reply.message } };
  }

  return { 200: { jobId: reply.jobId, sessionId: reply.sessionId } };
});
