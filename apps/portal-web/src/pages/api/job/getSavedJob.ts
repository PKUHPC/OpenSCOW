import { asyncUnaryCall } from "@ddadaal/tsgrpc-client";
import { status } from "@grpc/grpc-js";
import { authenticate } from "src/auth/server";
import { JobServiceClient, NewJobInfo } from "src/generated/portal/job";
import { getClient } from "src/utils/client";
import { route } from "src/utils/route";
import { handlegRPCError } from "src/utils/server";

export interface GetSavedJobSchema {

  method: "GET";

  query: {
    cluster: string;
    id: string;
  };

  responses: {
    200: {
      jobInfo: NewJobInfo;
    }

    400: {
      message: string;
    }

    404: { code: "TEMPLATE_NOT_FOUND" };

   }
}

const auth = authenticate(() => true);

export default route<GetSavedJobSchema>("GetSavedJobSchema", async (req, res) => {


  const info = await auth(req, res);

  if (!info) { return; }

  const { cluster, id } = req.query;

  const client = getClient(JobServiceClient);

  return asyncUnaryCall(client, "getJobTemplate", {
    userId: info.identityId, cluster, templateId: id,
  }).then(({ jobInfo }) => ({ 200: { jobInfo: jobInfo! } }), handlegRPCError({
    [status.NOT_FOUND]: () => ({ 404: { code: "TEMPLATE_NOT_FOUND" } as const }),
  }));


});
