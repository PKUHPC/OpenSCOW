import { route } from "@ddadaal/next-typed-api-routes-runtime";
import busboy from "busboy";
import { authenticate } from "src/auth/server";
import { getClusterLoginNode, sshRawConnect } from "src/utils/ssh";

export interface UploadFileSchema {
  method: "POST";

  query: {
    cluster: string;
    path: string;
  }

  responses: {
    204: null;
    400: { code: "INVALID_CLUSTER" }
  }
}

const auth = authenticate(() => true);

export default route<UploadFileSchema>("UploadFileSchema", async (req, res) => {

  const { cluster, path } = req.query;

  const info = await auth(req, res);

  if (!info) { return; }

  const host = getClusterLoginNode(cluster);

  if (!host) {
    return { 400: { code: "INVALID_CLUSTER" } };
  }

  const bb = busboy({ headers: req.headers });

  const ssh = await sshRawConnect(host, info.identityId);

  const sftp = await ssh.requestSFTP();

  const ws = sftp.createWriteStream(path);

  const disconnect = () => {
    ws.destroy();
    sftp.end();
    ssh.dispose();
  };

  bb.on("file", (name, file) => {
    file.pipe(ws);
  });

  bb.on("close", () => {
    disconnect();
    res.status(204).send(null);
  });

  bb.on("error", (error: Error) => {
    disconnect();
    res.status(500).send(new Error("Error reading file", { cause: error }) as any);
  });

  req.pipe(bb);
});

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};
