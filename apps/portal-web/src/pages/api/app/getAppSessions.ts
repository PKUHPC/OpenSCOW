import { asyncUnaryCall } from "@ddadaal/tsgrpc-client";
import { authenticate } from "src/auth/server";
import { AppServiceClient, AppSession } from "src/generated/portal/app";
import { getClient } from "src/utils/client";
import { route } from "src/utils/route";

export interface GetAppSessionsSchema {
  method: "GET";

  query: {
    cluster: string;
  }

  responses: {
    200: {
      sessions: AppSession[];
    };
  }
}

const auth = authenticate(() => true);

export default /* #__PURE__*/route<GetAppSessionsSchema>("GetAppSessionsSchema", async (req, res) => {


  const info = await auth(req, res);

  if (!info) { return; }

  const { cluster } = req.query;

  const client = getClient(AppServiceClient);

  return asyncUnaryCall(client, "listAppSessions", {
    cluster, userId: info.identityId,
  }).then((reply) => {
    return { 200: { sessions: reply.sessions } };
  });

});
