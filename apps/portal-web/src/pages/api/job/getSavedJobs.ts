import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncClientCall } from "@ddadaal/tsgrpc-utils";
import { authenticate } from "src/auth/server";
import { JobServiceClient, SavedJob } from "src/generated/portal/job";
import { getJobServerClient } from "src/utils/client";
import { publicConfig } from "src/utils/config";

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

  const info = await auth(req, res);

  if (!info) { return; }

  const { cluster } = req.query;

  // validate the parameters
  if (!(cluster in publicConfig.CLUSTERS_CONFIG)) {
    return { 400: { message: `Cluster ${cluster} not exists.` } };
  }

  const client = getJobServerClient(JobServiceClient);

  return await asyncClientCall(client, "getSavedJobs", {
    cluster,
    userId: info.identityId,
  })
    .then(({ results }) => ({ 200: { results } }));

});
