import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncClientCall } from "@ddadaal/tsgrpc-utils";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { authenticate } from "src/auth/server";
import { JobServiceClient } from "src/generated/server/job";
import { TenantRole } from "src/models/User";
import { checkJobAccessible } from "src/server/jobAccessible";
import { getClient } from "src/utils/client";
import { handlegRPCError } from "src/utils/server";

export interface QueryJobTimeLimitSchema {
  method: "GET";

  query: {
    cluster: string;

    jobId: string;
  }

  responses: {
    200: {
      result: number;
    };

    403: null;

    /** Job没有找到 */
    404: null;
  }
}

const auth = authenticate((info) => info.tenantRoles.includes(TenantRole.TENANT_ADMIN));

export default route<QueryJobTimeLimitSchema>("QueryJobTimeLimitSchema",
  async (req, res) => {

    const info = await auth(req, res);
    if (!info) {
      return;
    }

    const { cluster, jobId }  = req.query;

    const jobAccessible = await checkJobAccessible(jobId, cluster, info);

    if (jobAccessible === "NotAllowed") {
      return { 403: null };
    } else if (jobAccessible === "NotFound") {
      return { 404: null };
    }

    const client = getClient(JobServiceClient);

    return await asyncClientCall(client, "queryJobTimeLimit", {
      cluster,
      jobId,
    })
      .then(({ limit }) => ({ 200: { result: limit } }))
      .catch(handlegRPCError({
        [Status.NOT_FOUND]: () => ({ 404: null }),
      }));
  });
