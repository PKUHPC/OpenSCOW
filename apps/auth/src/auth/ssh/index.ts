import { FastifyInstance } from "fastify";
import { AuthProvider } from "src/auth/AuthProvider";
import { serveLoginHtml } from "src/auth/loginHtml";
import { registerPostHandler } from "src/auth/ssh/postHandler";
import { authConfig, SshConfigSchema } from "src/config/auth";
import { clusters } from "src/config/clusters";
import { ensureNotUndefined } from "src/utils/validations";

function checkLoginNode(sshConfig: SshConfigSchema) {

  let loginNode = sshConfig.baseNode;

  if (!loginNode) {
    if (Object.keys(clusters).length === 0) {
      throw new Error("No cluster has been set in clusters config");
    }
    const clusterConfig = Object.values(clusters)[0];
    loginNode = clusterConfig.slurm.loginNodes[0];

    if (!loginNode) {
      throw new Error(`Cluster ${clusterConfig.displayName} has no login node.`);
    }
  }

  return loginNode;
}

export const createSshAuthProvider = (f: FastifyInstance) => {

  const { ssh } = ensureNotUndefined(authConfig, ["ssh"]);

  const loginNode = checkLoginNode(ssh);

  f.log.info("Determined login node %s", loginNode);

  registerPostHandler(f, loginNode);

  return <AuthProvider>{
    serveLoginHtml: (callbackUrl, req, rep) => serveLoginHtml(false, callbackUrl, req, rep),
    fetchAuthTokenInfo: async () => undefined,
    validateName: undefined,
    createUser: undefined,
    changePassword: undefined,
  };

};
