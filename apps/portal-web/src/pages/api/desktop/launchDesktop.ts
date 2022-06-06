import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncClientCall } from "@ddadaal/tsgrpc-utils";
import { authenticate } from "src/auth/server";
import { VncServiceClient } from "src/generated/portal/vnc";
import { getJobServerClient } from "src/utils/client";
import { publicConfig } from "src/utils/config";
import { dnsResolve } from "src/utils/dns";

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

  const client = getJobServerClient(VncServiceClient);

  return await asyncClientCall(client, "launchDesktop", {
    cluster: req.body.cluster,
    username: info.identityId,
    displayId: req.body.displayId,
  })
    .then(async ({ node, password, port }) => {
      // nginx doesn't use /etc/hosts. The host must be resolved before passing to nginx
      return { 200: { node: await dnsResolve(node), password, port } };
    });
});
