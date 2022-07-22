import { authenticate } from "src/auth/server";
import { getClusterOps } from "src/clusterops";
import { RunningJob } from "src/generated/common/job";
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

  const clusterops = getClusterOps(cluster);

  const reply = await clusterops.job.getRunningJobs({
    userId,
  }, req.log);

  return { 200: { results: reply.jobs  } };

});
