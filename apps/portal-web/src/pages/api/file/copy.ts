import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { authenticate } from "src/auth/server";
import { createLogger } from "src/utils/log";
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
    400: { code: "INVALID_CLUSTER" };
  }
}

const auth = authenticate(() => true);

export default route<CopyFileItemSchema>("CopyFileItemSchema", async (req, res) => {

  const logger = createLogger();

  const info = await auth(req, res);

  if (!info) { return; }

  const { cluster, fromPath, toPath } = req.body;

  const host = getClusterLoginNode(cluster);

  if (!host) {
    return { 400: { code: "INVALID_CLUSTER" } };
  }

  return await sshConnect(host, info.identityId, logger, async (ssh) => {
    // the SFTPWrapper doesn't supprt copy
    // Use command to do it
    await ssh.exec("cp", ["-r", fromPath, toPath]);

    return { 204: null };
  });


});
