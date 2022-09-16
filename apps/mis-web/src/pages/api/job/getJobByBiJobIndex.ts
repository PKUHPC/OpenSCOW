import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncClientCall } from "@ddadaal/tsgrpc-utils";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { authenticate } from "src/auth/server";
import { JobInfo, JobServiceClient } from "src/generated/server/job";
import { TenantRole } from "src/models/User";
import { getClient } from "src/utils/client";
import { handlegRPCError } from "src/utils/server";

export interface GetJobByBiJobIndexSchema {
  method: "GET";

  query: {
    biJobIndex: string;
  }

  responses: {
    200: { info: JobInfo };
    /** 作业未找到 */
    404: null;
  }
}

const auth = authenticate((info) => info.tenantRoles.includes(TenantRole.TENANT_ADMIN));

export default route<GetJobByBiJobIndexSchema>("GetJobByBiJobIndexSchema",
  async (req, res) => {

    const info = await auth(req, res);
    if (!info) {
      return;
    }

    const { biJobIndex } = req.query;

    const client = getClient(JobServiceClient);

    return await asyncClientCall(client, "getJobByBiJobIndex", {
      biJobIndex,
    })
      .then(({ info }) => info ? ({ 200: { info } }) : ({ 404: null }))
      .catch(handlegRPCError({
        [Status.NOT_FOUND]: () => ({ 404: null }),
      }));
  });
