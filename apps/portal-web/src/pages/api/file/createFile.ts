import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { authenticate } from "src/auth/server";
import { sftpExists, sftpWriteFile } from "src/utils/sftp";
import { getClusterLoginNode, sshConnect } from "src/utils/ssh";

export interface CreateFileSchema {
  method: "POST";

  body: {
    cluster: string;
    path: string;
  }

  responses: {
    204: null;
    409: { code: "ALREADY_EXISTS" }
    400: { code: "INVALID_CLUSTER" };
  }
}

const auth = authenticate(() => true);

export default route<CreateFileSchema>("CreateFileSchema", async (req, res) => {
  const info = await auth(req, res);

  if (!info) { return; }

  const { cluster, path } = req.body;

  const host = getClusterLoginNode(cluster);

  if (!host) {
    return { 400: { code: "INVALID_CLUSTER" } };
  }

  return await sshConnect(host, info.identityId, req.log, async (ssh) => {
    const sftp = await ssh.requestSFTP();

    if (await sftpExists(sftp, path)) {
      return { 409: { code: "ALREADY_EXISTS" } };
    }

    await sftpWriteFile(sftp)(path, Buffer.alloc(0));

    return { 204: null };
  });


});
