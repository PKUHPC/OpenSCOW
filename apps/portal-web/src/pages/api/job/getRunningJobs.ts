import { asyncUnaryCall } from "@ddadaal/tsgrpc-client";
import { authenticate } from "src/auth/server";
import { RunningJob } from "src/generated/common/job";
import { JobServiceClient } from "src/generated/portal/job";
import { getClient } from "src/utils/client";
import { route } from "src/utils/route";

export interface GetRunningJobsSchema {

  method: "GET";

  query: {

    userId: string;

    cluster: string;
  }

  responses: {
    200: {
      results: RunningJob[];
    }

    403: null;
  }
}

const auth = authenticate(() => true);

export default route<GetRunningJobsSchema>("GetRunningJobsSchema", async (req, res) => {


  const info = await auth(req, res);

  if (!info) { return; }

  const { cluster, userId } = req.query;

  const client = getClient(JobServiceClient);

  return asyncUnaryCall(client, "listRunningJobs", {
    cluster, userId,
  }).then(({ results }) => ({ 200: { results } }));

});
