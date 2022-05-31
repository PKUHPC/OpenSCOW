import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncClientCall } from "@ddadaal/tsgrpc-utils";
import { status } from "@grpc/grpc-js";
import { authenticate } from "src/auth/server";
import { JobServiceClient } from "src/generated/portal/job";
import { getJobServerClient } from "src/utils/client";

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

  const client = getJobServerClient(JobServiceClient);

  const { cluster, jobId } = req.body;

  return await asyncClientCall(client, "cancelJob", {
    cluster,
    jobId,
    userId: info.identityId,
  })
    .then(() => {
      return { 204: null };
    }).catch((e) => {
      if (e.code === status.NOT_FOUND) {
        return { 404: null } as const;
      } else {
        throw e;
      }
    });
});
