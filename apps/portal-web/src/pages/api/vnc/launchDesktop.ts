import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncClientCall } from "@ddadaal/tsgrpc-utils";
import { authenticate } from "src/auth/server";
import { VncServiceClient } from "src/generated/portal/vnc";
import { getJobServerClient } from "src/utils/client";
import { publicConfig } from "src/utils/config";

export interface LaunchDesktopSchema {
  method: "POST";

  body: {
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

export default /*#__PURE__*/route<LaunchDesktopSchema>("LaunchDesktopSchema", async (req, res) => {

  if (!publicConfig.ENABLE_VNC) {
    return { 501: null };
  }

  const info = await auth(req, res);

  if (!info) { return; }

  const client = getJobServerClient(VncServiceClient);

  return await asyncClientCall(client, "launchDesktop", {
    cluster: req.body.cluster,
    username: info.identityId,
  })
    .then(({ node, password, port }) => {
      return { 200: { node, password, port } };
    });
});
