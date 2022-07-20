import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { authenticate } from "src/auth/server";
import { publicConfig } from "src/utils/config";
import { dnsResolve } from "src/utils/dns";
import { getClusterLoginNode, loggedExec, sshConnect } from "src/utils/ssh";
import { parseListOutput, VNCSERVER_BIN_PATH } from "src/utils/turbovnc";

export interface ListDesktopsSchema {
  method: "GET";

  query: {
    cluster: string;
  }

  responses: {
    200: {
      node: string;
      displayId: number[];
    };
    // 功能没有启用
    501: null;
  }
}

const auth = authenticate(() => true);

export default /* #__PURE__*/route<ListDesktopsSchema>("ListDesktopsSchema", async (req, res) => {

  if (!publicConfig.ENABLE_LOGIN_DESKTOP) {
    return { 501: null };
  }

  const info = await auth(req, res);

  if (!info) { return; }

  const { cluster } = req.query;

  const host = getClusterLoginNode(cluster);
  if (!host) { return { 400: { code: "INVALID_CLUSTER" } }; }

  return await sshConnect(host, info.identityId, req.log, async (ssh) => {

    // list all running session
    const resp = await loggedExec(ssh, req.log, true,
      VNCSERVER_BIN_PATH, ["-list"],
    );

    const ids = parseListOutput(resp.stdout);

    return {
      200: {
        node: await dnsResolve(host),
        displayId: ids,
      },
    };
  });

});
