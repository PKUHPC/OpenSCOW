import { asyncUnaryCall } from "@ddadaal/tsgrpc-client";
import { authenticate } from "src/auth/server";
import { JobInfo, JobServiceClient } from "src/generated/portal/job";
import { getClient } from "src/utils/client";
import { route } from "src/utils/route";

export interface GetAllJobsSchema {

  method: "GET";

  query: {
    cluster: string;
    startTime: string;
    endTime: string;
  }

  responses: {
    200: {
      results: JobInfo[];
    }

    403: null;
  }
}

const auth = authenticate(() => true);

export default route<GetAllJobsSchema>("GetAllJobsSchema", async (req, res) => {



  const info = await auth(req, res);

  if (!info) { return; }

  const { cluster, startTime, endTime } = req.query;

  const client = getClient(JobServiceClient);

  return asyncUnaryCall(client, "listAllJobs", {
    userId: info.identityId, cluster,
    startTime, endTime,
  }).then(({ results }) => ({ 200: { results } }));

});
