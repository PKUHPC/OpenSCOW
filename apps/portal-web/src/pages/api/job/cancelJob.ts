import { authenticate } from "src/auth/server";
import { getClusterOps } from "src/clusterops";
import { route } from "src/utils/route";

export interface CancelJobSchema {
  method: "DELETE";

  body: {
    cluster: string;
    jobId: number;
  }

  responses: {
    204: null;
    404: null;
  }
}

const auth = authenticate(() => true);

export default /* #__PURE__*/route<CancelJobSchema>("CancelJobSchema", async (req, res) => {



  const info = await auth(req, res);

  if (!info) { return; }

  const { cluster, jobId } = req.body;

  const clusterops = getClusterOps(cluster);

  const reply = await clusterops.job.cancelJob({
    jobId,
    userId: info.identityId,
  }, req.log);


  if (reply.code === "NOT_FOUND") { return { 404: null };}
  return { 204: null };
});
