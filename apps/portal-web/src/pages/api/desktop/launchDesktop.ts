import { authenticate } from "src/auth/server";
import { displayIdToPort } from "src/clusterops/slurm/bl/port";
import { publicConfig } from "src/utils/config";
import { dnsResolve } from "src/utils/dns";
import { route } from "src/utils/route";
import { getClusterLoginNode, sshConnect } from "src/utils/ssh";
import { refreshPassword } from "src/utils/turbovnc";

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

  const host = getClusterLoginNode(cluster);

  if (!host) { return { 400: { code: "INVALID_CLUSTER" } }; }

  return await sshConnect(host, info.identityId, async (ssh) => {

    // refresh the otp
    const password = await refreshPassword(ssh, req.log, displayId);

    return { 200: { node: await dnsResolve(host), port: displayIdToPort(displayId), password } };
  });
});
