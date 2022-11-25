import { asyncUnaryCall } from "@ddadaal/tsgrpc-client";
import { status } from "@grpc/grpc-js";
import { authenticate } from "src/auth/server";
import { AppServiceClient } from "src/generated/portal/app";
import { getClient } from "src/utils/client";
import { route } from "src/utils/route";
import { handlegRPCError } from "src/utils/server";

export interface CreateAppSessionSchema {
  method: "POST";

  body: {
    cluster: string;
    appId: string;
    account: string;
    partition: string | undefined;
    qos: string | undefined;
    coreCount: number;
    maxTime: number;
    customAttributes: { [key: string]: string };
  }

  responses: {
    200: {
      jobId: number;
      sessionId: string;
    };

    400: {
      code: "INVALID_INPUT";
      message: string;
    }

    404: {
      code: "APP_NOT_FOUND";
    }

    409: {
      code: "SBATCH_FAILED";
      message: string;
    }

  }
}

const auth = authenticate(() => true);

export default /* #__PURE__*/route<CreateAppSessionSchema>("CreateAppSessionSchema", async (req, res) => {


  const info = await auth(req, res);

  if (!info) { return; }

  const { appId, cluster, coreCount, partition, qos, account, maxTime, customAttributes } = req.body;

  const client = getClient(AppServiceClient);

  return await asyncUnaryCall(client, "createAppSession", {
    appId,
    cluster,
    userId: info.identityId,
    coreCount,
    account,
    maxTime,
    partition,
    qos,
    customAttributes,
  }).then((reply) => {
    return { 200: { jobId: reply.jobId, sessionId: reply.sessionId } };
  }, handlegRPCError({
    [status.INTERNAL]: (e) => ({ 409: { code: "SBATCH_FAILED" as const, message: e.details } }),
    [status.NOT_FOUND]: (e) => ({ 404: { code: "APP_NOT_FOUND" as const, message: e.details } }),
    [status.INVALID_ARGUMENT]: (e) => ({ 400: { code: "INVALID_INPUT" as const, message: e.details } }),
  }));

});
