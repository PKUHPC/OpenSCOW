import { asyncUnaryCall } from "@ddadaal/tsgrpc-client";
import { authenticate } from "src/auth/server";
import { DesktopServiceClient } from "src/generated/portal/desktop";
import { getClient } from "src/utils/client";
import { publicConfig } from "src/utils/config";
import { dnsResolve } from "src/utils/dns";
import { route } from "src/utils/route";
import { handlegRPCError } from "src/utils/server";

export interface LaunchDesktopSchema {
  method: "POST";

  body: {
    displayId: number;
    cluster: string;
  }

  responses: {
    200: {
      node: string;
      port: number;
      password: string;
    };
    // 功能没有启用
    501: null;
  }
}

const auth = authenticate(() => true);

export default /* #__PURE__*/route<LaunchDesktopSchema>("LaunchDesktopSchema", async (req, res) => {
  if (!publicConfig.ENABLE_LOGIN_DESKTOP) {
    return { 501: null };
  }

  const info = await auth(req, res);

  if (!info) { return; }

  const { cluster, displayId } = req.body;

  const client = getClient(DesktopServiceClient);

  return await asyncUnaryCall(client, "connectToDesktop", {
    cluster, displayId, userId: info.identityId,
  }).then(async ({ node, password, port }) => ({ 200: {
    node: await dnsResolve(node),
    password,
    port,
  } }), handlegRPCError({

  }));
});
