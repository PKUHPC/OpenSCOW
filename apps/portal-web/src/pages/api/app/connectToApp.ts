import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncClientCall } from "@ddadaal/tsgrpc-utils";
import { status } from "@grpc/grpc-js";
import { App } from "@scow/config/build/appConfig/app";
import { authenticate } from "src/auth/server";
import { AppServiceClient } from "src/generated/portal/app";
import { getJobServerClient } from "src/utils/client";
import { runtimeConfig } from "src/utils/config";
import { dnsResolve } from "src/utils/dns";
import { handlegRPCError } from "src/utils/server";

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

const appProps = runtimeConfig.APPS.reduce((prev, curr) => {
  prev[curr.id] = curr;
  return prev;
}, {} as Record<string, App>);

const auth = authenticate(() => true);

export default /* #__PURE__*/route<ConnectToAppSchema>("ConnectToAppSchema", async (req, res) => {

  const info = await auth(req, res);

  if (!info) { return; }

  const client = getJobServerClient(AppServiceClient);

  const { cluster, sessionId } = req.body;

  const reply = await asyncClientCall(client, "connectToApp", {
    cluster,
    userId: info.identityId,
    sessionId,
  }).catch(handlegRPCError({
    [status.UNAVAILABLE]: () => [({ 409: null })],
    [status.NOT_FOUND]: () => [({ 404: null })],
  }));

  if (Array.isArray(reply)) { return reply[0]; }

  const app = appProps[reply.appId];

  if (!app) { throw new Error(`Unknown app ${reply.appId}`);}

  const resolvedHost = await dnsResolve(reply.host);

  if (app.type === "web") {
    return {
      200: {
        host: resolvedHost,
        port: reply.port,
        password: reply.password,
        connect: app.connect,
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


