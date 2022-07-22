import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { authenticate } from "src/auth/server";
import { createLogger } from "src/utils/log";
import { getClusterLoginNode, sshConnect, sshRmrf } from "src/utils/ssh";

export interface DeleteDirSchema {
  method: "DELETE";

  body: {
    cluster: string;
    path: string;
  }

  responses: {
    204: null;
    400: { code: "INVALID_CLUSTER" };
  }
}

const auth = authenticate(() => true);

export default route<DeleteDirSchema>("DeleteDirSchema", async (req, res) => {

  const logger = createLogger();

  const info = await auth(req, res);

  if (!info) { return; }

  const { cluster, path } = req.body;

  const host = getClusterLoginNode(cluster);

  if (!host) {
    return { 400: { code: "INVALID_CLUSTER" } };
  }

  return await sshConnect(host, info.identityId, logger, async (ssh) => {
    await sshRmrf(ssh, path);

    return { 204: null };
  });


});
