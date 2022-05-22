import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncClientCall } from "@ddadaal/tsgrpc-utils";
import { status } from "@grpc/grpc-js";
import { authenticate } from "src/auth/server";
import { JobInfo, JobServiceClient } from "src/generated/portal/job";
import { ensureNotUndefined } from "src/utils/checkNull";
import { getJobServerClient } from "src/utils/client";
import { publicConfig } from "src/utils/config";

export interface GetSavedJobSchema {

  method: "GET";

  query: {
    cluster: string;
    jobName: string;
  };

  responses: {
    200: {
      jobInfo: JobInfo;
    }

    400: {
      message: string;
    }

    404: null;

   }
}

const auth = authenticate(() => true);

export default route<GetSavedJobSchema>("GetSavedJobSchema", async (req, res) => {

  const info = await auth(req, res);

  if (!info) { return; }

  const { cluster, jobName } = req.query;

  // validate the parameters
  if (!(cluster in publicConfig.CLUSTERS_CONFIG)) {
    return { 400: { message: `Cluster ${cluster} not exists.` } };
  }

  const client = getJobServerClient(JobServiceClient);

  return await asyncClientCall(client, "getSavedJob", {
    cluster,
    userId: info.identityId,
    jobName,
  })
    .then((reply) => {
      const { jobInfo } = ensureNotUndefined(reply, ["jobInfo"]);

      return { 200: { jobInfo } } as const;
    })
    .catch((e) => {
      if (e.code === status.NOT_FOUND) {
        return { 404: null } as const;
      } else {
        throw e;
      }
    });
});
