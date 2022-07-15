import formBody from "@fastify/formbody";
import { getConfigFromFile } from "@scow/config";
import { ClustersConfigName, ClustersConfigSchema } from "@scow/config/build/appConfig/clusters";
import { Static, Type } from "@sinclair/typebox";
import { FastifyInstance } from "fastify";
import { NodeSSH } from "node-ssh";
import { cacheInfo } from "src/auth/cacheInfo";
import { serveLoginHtml } from "src/auth/loginHtml";
import { config } from "src/config/env";
import { redirectToWeb } from "src/routes/callback";

type ValueOf<T> = T[keyof T];

export function registerPostHandler(f: FastifyInstance) {

  const clusters = getConfigFromFile(ClustersConfigSchema, ClustersConfigName);

  let clusterConfig: ValueOf<typeof clusters>;
  if (config.SSH_BASE_CLUSTER) {
    clusterConfig = clusters[config.SSH_BASE_CLUSTER];
    if (!clusterConfig) {
      throw new Error("Unknown cluster " + config.SSH_BASE_CLUSTER + " set by SSH_BASE_CLUSTER");
    }
  } else {
    if (Object.keys(clusters).length === 0) {
      throw new Error("No cluster has been set in clusters config");
    }
    clusterConfig = Object.values(clusters)[0];
  }

  const loginNode = clusterConfig.loginNodes[0];

  if (!loginNode) {
    throw new Error(`Cluster ${clusterConfig.displayName} has no login node.`);
  }

  const [host, port] = loginNode.split(":");

  f.register(formBody);

  const bodySchema = Type.Object({
    username: Type.String(),
    password: Type.String(),
    callbackUrl: Type.String(),
  });

  // register a login handler
  f.post<{ Body: Static<typeof bodySchema> }>("/public/auth", {
    schema: { body: bodySchema },
  }, async (req, res) => {
    const { username, password, callbackUrl } = req.body;

    const logger = req.log.child({ plugin: "ldap" });

    // login to the a login node

    const ssh = new NodeSSH();

    try {
      await ssh.connect({ username, password, host, port: +port });
      const info = await cacheInfo(username, req);
      await redirectToWeb(callbackUrl, info, res);
    } catch (e) {
      logger.info("Log in as %s failed. Erro: %o", username, e);
      await serveLoginHtml(true, callbackUrl, req, res);
    } finally {
      ssh.dispose();

    }

  });
}
