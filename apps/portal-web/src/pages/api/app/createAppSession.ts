import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncClientCall } from "@ddadaal/tsgrpc-utils";
import { status } from "@grpc/grpc-js";
import { authenticate } from "src/auth/server";
import { AppServiceClient } from "src/generated/portal/app";
import { getJobServerClient } from "src/utils/client";

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
  }

  responses: {
    200: {
      jobId: number;
      sessionId: string;
    };

    400: {
      message: string;
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

  const client = getJobServerClient(AppServiceClient);

  const { appId, cluster, coreCount, partition, qos, account, maxTime } = req.body;

  return await asyncClientCall(client, "createApp", {
    cluster,
    appId,
    userId: info.identityId,
    coreCount,
    account,
    maxTime,
    partition,
    qos,
  })
    .then(({ jobId, sessionId }) => {
      return { 200: { jobId, sessionId } };
    }).catch((e) => {
      if (e.code === status.UNAVAILABLE) {
        return { 409: { code: "SBATCH_FAILED", message: e.details } } as const;
      } else {
        throw e;
      }
    });
});
