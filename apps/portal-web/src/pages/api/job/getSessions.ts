import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncClientCall } from "@ddadaal/tsgrpc-utils";
import { authenticate } from "src/auth/server";
import { AppServiceClient, AppSession_Address, AppSession_State } from "src/generated/portal/app";
import { getJobServerClient } from "src/utils/client";

export interface AppSession {
  sessionId: string;
  jobId: number;
  submitTime?: string;
  appId: string;
  state: AppSession_State;
  address?: AppSession_Address | undefined;
}

export interface GetSessionsSchema {
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

export default /* #__PURE__*/route<GetSessionsSchema>("GetSessionsSchema", async (req, res) => {

  const info = await auth(req, res);

  if (!info) { return; }

  const client = getJobServerClient(AppServiceClient);

  const { cluster } = req.query;

  return await asyncClientCall(client, "getSessions", {
    cluster,
    userId: info.identityId,
  })
    .then(({ sessions }) => {
      return { 200: { sessions } };
    });
});
