import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { authenticate } from "src/auth/server";
import { getClusterOps } from "src/clusterops";
import { NewJobInfo } from "src/generated/portal/job";
import { createLogger } from "src/utils/log";

export interface GetSavedJobSchema {

  method: "GET";

  query: {
    cluster: string;
    id: string;
  };

  responses: {
    200: {
      jobInfo: NewJobInfo;
    }

    400: {
      message: string;
    }

    404: null;

   }
}

const auth = authenticate(() => true);

export default route<GetSavedJobSchema>("GetSavedJobSchema", async (req, res) => {
  const logger = createLogger();

  const info = await auth(req, res);

  if (!info) { return; }

  const { cluster, id } = req.query;

  const clusterops = getClusterOps(cluster);

  const reply = await clusterops.job.getSavedJob({ 
    id, userId: info.identityId,
  }, logger);

  if (reply.code === "NOT_FOUND") { return { 404: null };}

  return { 200: { jobInfo: reply.jobInfo } };
});
