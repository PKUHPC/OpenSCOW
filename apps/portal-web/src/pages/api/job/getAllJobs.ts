import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { authenticate } from "src/auth/server";
import { getClusterOps } from "src/clusterops";
import { JobInfo } from "src/generated/portal/job";

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

  const clusterops = getClusterOps(cluster);

  const reply = await clusterops.job.getAllJobsInfo({ 
    userId: info.identityId,
    endTime: new Date(endTime),
    startTime: new Date(startTime),
  }, req.log);

  return { 200: { results: reply.jobs  } };

});
