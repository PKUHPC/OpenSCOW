import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { authenticate } from "src/auth/server";
import { getClusterOps } from "src/clusterops";
import { SavedJob } from "src/clusterops/api/job";
import { createLogger } from "src/utils/log";

export interface GetSavedJobsSchema {

  method: "GET";

  query: {
    cluster: string;
  };

  responses: {
    200: {
      results: SavedJob[];
    }

    400: {
      message: string;
    }

    404: null;
   }
}

const auth = authenticate(() => true);

export default route<GetSavedJobsSchema>("GetSavedJobsSchema", async (req, res) => {
  const logger = createLogger();

  const info = await auth(req, res);

  if (!info) { return; }

  const { cluster } = req.query;

  const clusterops = getClusterOps(cluster);

  const reply = await clusterops.job.getSavedJobs({ 
    userId: info.identityId,
  }, logger);

  return { 200: { results: reply.results } };

});
