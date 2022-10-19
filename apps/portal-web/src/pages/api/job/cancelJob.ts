import { asyncUnaryCall } from "@ddadaal/tsgrpc-client";
import { status } from "@grpc/grpc-js";
import { authenticate } from "src/auth/server";
import { JobServiceClient } from "src/generated/portal/job";
import { getClient } from "src/utils/client";
import { route } from "src/utils/route";
import { handlegRPCError } from "src/utils/server";

export interface CancelJobSchema {
  method: "DELETE";

  body: {
    cluster: string;
    jobId: number;
  }

  responses: {
    204: null;
    404: { code: "JOB_NOT_FOUND" };
  }
}

const auth = authenticate(() => true);

export default /* #__PURE__*/route<CancelJobSchema>("CancelJobSchema", async (req, res) => {

  const info = await auth(req, res);

  if (!info) { return; }

  const { cluster, jobId } = req.body;

  const client = getClient(JobServiceClient);

  return asyncUnaryCall(client, "cancelJob", {
    jobId, userId: info.identityId, cluster,
  }).then(() => ({ 204: null }), handlegRPCError({
    [status.NOT_FOUND]: () => ({ 404: { code: "JOB_NOT_FOUND" } }) as const,
  }));
});
