import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncClientCall } from "@ddadaal/tsgrpc-utils";
import { authenticate } from "src/auth/server";
import { JobInfo, JobServiceClient } from "src/generated/portal/job";
import { getJobServerClient } from "src/utils/client";

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

  const client = getJobServerClient(JobServiceClient);

  const resp = await asyncClientCall(client, "getAllJobsInfo", {
    cluster, userId: info.identityId,
    endTime,
    startTime,
  });

  return { 200: { results: resp.jobs  } };

});
