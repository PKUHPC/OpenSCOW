import { asyncUnaryCall } from "@ddadaal/tsgrpc-client";
import { status } from "@grpc/grpc-js";
import { authenticate } from "src/auth/server";
import { DesktopServiceClient } from "src/generated/portal/desktop";
import { getClient } from "src/utils/client";
import { publicConfig } from "src/utils/config";
import { dnsResolve } from "src/utils/dns";
import { route } from "src/utils/route";
import { handlegRPCError } from "src/utils/server";

export interface CreateDesktopSchema {
  method: "POST";

  body: {
    cluster: string;

    // the name of the wm
    wm: string;
  }

  responses: {
    200: {
      node: string;
      port: number;
      password: string;
    };

    400: {
      code: "INVALID_WM" | "INVALID_CLUSTER";
    }

    409: {
      code: "TOO_MANY_DESKTOPS";
    }

    // 功能没有启用
    501: null;
  }
}

const auth = authenticate(() => true);

export default /* #__PURE__*/route<CreateDesktopSchema>("CreateDesktopSchema", async (req, res) => {

  if (!publicConfig.ENABLE_LOGIN_DESKTOP) {
    return { 501: null };
  }

  const info = await auth(req, res);

  if (!info) { return; }

  const { cluster, wm } = req.body;

  const client = getClient(DesktopServiceClient);

  return await asyncUnaryCall(client, "createDesktop", {
    cluster, userId: info.identityId, wm,
  }).then(
    async ({ node, password, port }) => ({
      200: { node: await dnsResolve(node), password, port },
    }),
    handlegRPCError({
      [status.NOT_FOUND]: () => ({ 400: { code: "INVALID_CLUSTER" as const } }),
      [status.INVALID_ARGUMENT]: () => ({ 400: { code: "INVALID_WM" as const } }),
      [status.RESOURCE_EXHAUSTED]: () => ({ 409: { code: "TOO_MANY_DESKTOPS" as const } }),
    }));


});
