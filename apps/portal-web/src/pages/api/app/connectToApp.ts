import { authenticate } from "src/auth/server";
import { getClusterOps } from "src/clusterops";
import { runtimeConfig } from "src/utils/config";
import { dnsResolve } from "src/utils/dns";
import { route } from "src/utils/route";

// Cannot use ServerConnectPropsConfig from appConfig package
export type AppConnectProps = {
  method: string;
  path: string;
  query?: { [key: string]: string };
  formData?: { [key: string]: string };
}

export interface ConnectToAppSchema {
  method: "POST";

  body: {
    cluster: string;
    sessionId: string;
  }

  responses: {
    200: { host: string; port: number; password: string } & (
      | { type: "web"; connect: AppConnectProps }
      | { type: "vnc"; }
    );


    // sessionId not exists
    404: null;

    // the session cannot be connected
    409: null;

  }
}

const auth = authenticate(() => true);

export default /* #__PURE__*/route<ConnectToAppSchema>("ConnectToAppSchema", async (req, res) => {

  const info = await auth(req, res);

  if (!info) { return; }

  const { cluster, sessionId } = req.body;

  const clusterops = getClusterOps(cluster);

  const reply = await clusterops.app.connectToApp({
    sessionId, userId: info.identityId,
  }, req.log);

  if (reply.code === "NOT_FOUND") { return { 404: null };}
  if (reply.code === "UNAVAILABLE") { return { 409: null };}

  const app = runtimeConfig.APPS[reply.appId];

  if (!app) { throw new Error(`Unknown app ${reply.appId}`);}

  const resolvedHost = await dnsResolve(reply.host);

  if (app.type === "web") {
    return {
      200: {
        host: resolvedHost,
        port: reply.port,
        password: reply.password,
        connect: app.web!.connect,
        type: "web",
      },
    };
  } else {
    return {
      200: {
        host: resolvedHost,
        port: reply.port,
        password: reply.password,
        type: "vnc",
      },
    };
  }


});


