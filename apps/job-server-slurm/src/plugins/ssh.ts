import { Logger, plugin } from "@ddadaal/tsgrpc-server";
import { ServiceError } from "@grpc/grpc-js";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { NodeSSH, SSHExecOptions } from "node-ssh";
import { ALL_NODES, COMPUTE_NODES, config, LOGIN_NODES } from "src/config";

export interface SshPlugin {
  connect: <T>(node: string, username: string, logger: Logger,
    run: (ssh: NodeSSH, nodeAddr: string) => Promise<T>) => Promise<T>,
}

export async function loggedExec(ssh: NodeSSH, logger: Logger, throwIfFailed: boolean,
  cmd: string, parameters: string[], options?: SSHExecOptions) {
  const resp = await ssh.exec(cmd, parameters, { ...options, stream: "both" });
  if (resp.code !== 0) {
    logger.error("Command %o failed. stdout %s, stderr %s", [cmd, ...parameters], resp.stdout, resp.stderr);
    if (throwIfFailed) {
      throw <ServiceError> {
        code: Status.INTERNAL,
        message: "Command execution failed.",
      };
    }
  }
  return resp;
}


export const sshPlugin = plugin(async (s) => {

  s.logger.info("Known login nodes %o", LOGIN_NODES);
  s.logger.info("Known compute nodes %o", COMPUTE_NODES);

  s.addExtension("connect", <SshPlugin["connect"]>(
    async (node, username, logger, run) => {
      const nodeAddr = ALL_NODES[node];
      if (!nodeAddr) { throw new Error(`Unknown node ${node}`); }

      const ssh = new NodeSSH();

      await ssh.connect({ host: nodeAddr, username, privateKey: config.SSH_PRIVATE_KEY_PATH });
      logger.info("Connected to %s (addr: %s) as %s", node, nodeAddr, username);

      const value = await run(ssh, nodeAddr).finally(() => {
        ssh.dispose();
        logger.info("Disconnected from %s (addr: %s) as %s", node, nodeAddr, username);
      });

      return value;
    }
  ));
});

