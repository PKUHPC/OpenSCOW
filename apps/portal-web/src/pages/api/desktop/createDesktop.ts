import { authenticate } from "src/auth/server";
import { displayIdToPort } from "src/clusterops/slurm/bl/port";
import { publicConfig, runtimeConfig } from "src/utils/config";
import { dnsResolve } from "src/utils/dns";
import { route } from "src/utils/route";
import { getClusterLoginNode, loggedExec, sshConnect } from "src/utils/ssh";
import { parseDisplayId, parseListOutput, parseOtp, VNCSERVER_BIN_PATH } from "src/utils/turbovnc";

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

  if (publicConfig.LOGIN_DESKTOP_WMS.find((x) => x.wm === wm) === undefined) {
    return { 400: { code: "INVALID_WM", message: `${wm} is not a acceptable wm.` } };
  }

  const host = getClusterLoginNode(cluster);

  if (!host) { return { 400: { code: "INVALID_CLUSTER" } }; }

  return await sshConnect(host, info.identityId, req.log, async (ssh) => {

    // find if the user has running session
    let resp = await loggedExec(ssh, req.log, true,
      VNCSERVER_BIN_PATH, ["-list"],
    );

    const ids = parseListOutput(resp.stdout);

    if (ids.length >= runtimeConfig.PORTAL_CONFIG.loginDesktop.maxDesktops) {
      return { 409: { code: "TOO_MANY_DESKTOPS" } as const };
    }

    // start a session

    // explicitly set securitytypes to avoid requiring setting vnc passwd
    const params = ["-securitytypes", "OTP", "-otp"];

    if (wm) {
      params.push("-wm");
      params.push(wm);
    }

    resp = await loggedExec(ssh, req.log, true, VNCSERVER_BIN_PATH, params);

    // parse the OTP from output. the output was in stderr
    const password = parseOtp(resp.stderr);
    // parse display id from output
    const displayId = parseDisplayId(resp.stderr);

    const port = displayIdToPort(displayId);

    return { 200: { node: await dnsResolve(host), password, port } };
  });
});
