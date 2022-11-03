import { asyncUnaryCall } from "@ddadaal/tsgrpc-client";
import { authenticate } from "src/auth/server";
import { JobServiceClient, JobTemplate } from "src/generated/portal/job";
import { getClient } from "src/utils/client";
import { route } from "src/utils/route";

export interface GetSavedJobsSchema {

  method: "GET";

  query: {
    cluster: string;
  };

  responses: {
    200: {
      results: JobTemplate[];
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

  const client = getClient(JobServiceClient);

  return asyncUnaryCall(client, "listJobTemplates", {
    userId: info.identityId, cluster,
  }).then(({ results }) => ({ 200: { results } }));

});
