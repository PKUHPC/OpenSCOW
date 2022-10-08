import { authenticate } from "src/auth/server";
import { route } from "src/utils/route";
import { getClusterLoginNode, sshConnect } from "src/utils/ssh";

export interface CopyFileItemSchema {
  method: "PATCH";

  body: {
    cluster: string;
    fromPath: string;
    toPath: string;
  }

  responses: {
    204: null;
    415: {
      code: "CP_CMD_FAILED";
      // stderr of the cp command
      error: string;
    }
    400: { code: "INVALID_CLUSTER" };
  }
}

const auth = authenticate(() => true);

export default route<CopyFileItemSchema>("CopyFileItemSchema", async (req, res) => {



  const info = await auth(req, res);

  if (!info) { return; }

  const { cluster, fromPath, toPath } = req.body;

  const host = getClusterLoginNode(cluster);

  if (!host) {
    return { 400: { code: "INVALID_CLUSTER" } };
  }

  return await sshConnect(host, info.identityId, req.log, async (ssh) => {
    // the SFTPWrapper doesn't supprt copy
    // Use command to do it
    const resp = await ssh.exec("cp", ["-r", fromPath, toPath], { stream: "both" });

    if (resp.code !== 0) {
      return { 415: { code: "CP_CMD_FAILED", error: resp.stderr } };
    }

    return { 204: null };
  });


});
