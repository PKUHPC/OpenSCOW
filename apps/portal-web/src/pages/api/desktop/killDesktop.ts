import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { authenticate } from "src/auth/server";
import { publicConfig } from "src/utils/config";
import { getClusterLoginNode, loggedExec, sshConnect } from "src/utils/ssh";
import { VNCSERVER_BIN_PATH } from "src/utils/turbovnc";

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

  const host = getClusterLoginNode(cluster);

  if (!host) { return { 400: { code: "INVALID_CLUSTER" } }; }

  return await sshConnect(host, info.identityId, req.log, async (ssh) => {

    // kill specific desktop
    await loggedExec(ssh, req.log, true, VNCSERVER_BIN_PATH, ["-kill", ":" + displayId]);

    return { 204: null };
  });

});
