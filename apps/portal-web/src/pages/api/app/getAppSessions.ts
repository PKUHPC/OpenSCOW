import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { authenticate } from "src/auth/server";
import { getClusterOps } from "src/clusterops";
import { AppSession } from "src/clusterops/api/app";
import { createLogger } from "src/utils/log";

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

  const logger = createLogger();

  const info = await auth(req, res);

  if (!info) { return; }

  const { cluster } = req.query;

  const clusterops = getClusterOps(cluster);

  const reply = await clusterops.app.getAppSessions({ userId: info.identityId }, logger);

  return { 200: { sessions: reply.sessions } };
});
