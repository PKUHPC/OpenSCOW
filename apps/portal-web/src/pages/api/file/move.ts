import { sftpRename } from "@scow/lib-ssh";
import { authenticate } from "src/auth/server";
import { route } from "src/utils/route";
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
    415: { code: "RENAME_FAILED", error: string };
    400: { code: "INVALID_CLUSTER" };
  }
}

const auth = authenticate(() => true);

export default route<MoveFileItemSchema>("MoveFileItemSchema", async (req, res) => {

  const info = await auth(req, res);

  if (!info) { return; }

  const { cluster, fromPath, toPath } = req.body;

  const host = getClusterLoginNode(cluster);

  if (!host) {
    return { 400: { code: "INVALID_CLUSTER" } };
  }

  return await sshConnect(host, info.identityId, req.log, async (ssh) => {
    const sftp = await ssh.requestSFTP();

    const error = await sftpRename(sftp)(fromPath, toPath).catch((e) => e);
    if (error) {
      return { 415: { code: "RENAME_FAILED", error } };
    }

    return { 204: null };
  });


});
