import { asyncUnaryCall } from "@ddadaal/tsgrpc-client";
import { authenticate } from "src/auth/server";
import { DesktopServiceClient } from "src/generated/portal/desktop";
import { getClient } from "src/utils/client";
import { publicConfig } from "src/utils/config";
import { route } from "src/utils/route";

export interface KillDesktopSchema {
  method: "POST";

  body: {
    displayId: number;
    cluster: string;
  }

  responses: {
    204: null;
    // 功能没有启用
    501: null;
  }
}

const auth = authenticate(() => true);

export default /* #__PURE__*/route<KillDesktopSchema>("KillDesktopSchema", async (req, res) => {

  if (!publicConfig.ENABLE_LOGIN_DESKTOP) {
    return { 501: null };
  }

  const info = await auth(req, res);

  if (!info) { return; }

  const { cluster, displayId } = req.body;

  const client = getClient(DesktopServiceClient);

  return await asyncUnaryCall(client, "killDesktop", {
    cluster, displayId, userId: info.identityId,
  }).then(() => ({ 204: null }));

});
