import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncClientCall } from "@ddadaal/tsgrpc-utils";
import { authenticate } from "src/auth/server";
import { VncServiceClient } from "src/generated/portal/vnc";
import { getJobServerClient } from "src/utils/client";
import { publicConfig } from "src/utils/config";

export interface CreateDesktopSchema {
  method: "POST";

  body: {
    cluster: string;
  }

  responses: {
    200: {
      createSuccess: boolean;  
      node: string;
      port: number;
      password: string;
      alreadyDisplay: number;
      maxDisplay: number;
    };
    // 功能没有启用
    501: null;
  }
}

const auth = authenticate(() => true);

export default /*#__PURE__*/route<CreateDesktopSchema>("CreateDesktopSchema", async (req, res) => {

  if (!publicConfig.ENABLE_VNC) {
    return { 501: null };
  }

  const info = await auth(req, res);

  if (!info) { return; }

  const client = getJobServerClient(VncServiceClient);

  return await asyncClientCall(client, "createDesktop", {
    cluster: req.body.cluster,
    username: info.identityId,
  })
    .then(({ createSuccess, node, password, port, alreadyDisplay, maxDisplay  }) => {
      return { 200: { createSuccess, node, password, port, alreadyDisplay, maxDisplay } };
    });
});
