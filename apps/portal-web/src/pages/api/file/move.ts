import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { authenticate } from "src/auth/server";
import { createLogger } from "src/utils/log";
import { sftpRename } from "src/utils/sftp";
import { getClusterLoginNode, sshConnect } from "src/utils/ssh";

export interface MoveFileItemSchema {
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

export default route<MoveFileItemSchema>("MoveFileItemSchema", async (req, res) => {

  const logger = createLogger();

  const info = await auth(req, res);

  if (!info) { return; }

  const { cluster, fromPath, toPath } = req.body;

  const host = getClusterLoginNode(cluster);

  if (!host) {
    return { 400: { code: "INVALID_CLUSTER" } };
  }

  return await sshConnect(host, info.identityId, logger, async (ssh) => {
    const sftp = await ssh.requestSFTP();

    await sftpRename(sftp)(fromPath, toPath);

    return { 204: null };
  });


});
