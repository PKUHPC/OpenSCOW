import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncClientCall } from "@ddadaal/tsgrpc-utils";
import { authenticate } from "src/auth/server";
import { RunningJob } from "src/generated/common/job";
import { JobServiceClient } from "src/generated/portal/job";
import { getJobServerClient } from "src/utils/client";

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

  const client = getJobServerClient(JobServiceClient);

  const resp = await asyncClientCall(client, "getRunningJobs", {
    cluster,
    userId,
  });

  return { 200: { results: resp.jobs  } };

});
