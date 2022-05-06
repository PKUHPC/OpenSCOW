import { plugin } from "@ddadaal/tsgrpc-server";
import { ServiceError } from "@grpc/grpc-js";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { NodeSSH, SSHExecCommandResponse } from "node-ssh";
import { config, nodes } from "src/config";

export interface SshPlugin {
  connect: <T>(node: string, run: (ssh: NodeSSH, nodeAddr: string) => Promise<T>) => Promise<T>,

  runAsUser: (ssh: NodeSSH, username: string, ...cmds: string[]) => Promise<SSHExecCommandResponse>;
}

export const sshPlugin = plugin(async (s) => {

  const logger = s.logger.child({ plugin: "slurm" });

  logger.info("Known nodes %o", nodes);

  s.addExtension("connect", <SshPlugin["connect"]>(
    async (node, run) => {
      const nodeAddr = nodes[node];
      if (!nodeAddr) { throw new Error(`Unknown node ${node}`); }

      const ssh = new NodeSSH();

      await ssh.connect({ host: nodeAddr, username: "root", privateKey: config.SSH_PRIVATE_KEY_PATH });

      const value = await run(ssh, nodeAddr).finally(() => ssh.dispose());

      return value;
    }
  ));

  s.addExtension("runAsUser", <SshPlugin["runAsUser"]>(
    async (ssh, username, ...cmds) => {
      const resp = await ssh.exec("sudo", ["-u", username, ...cmds], { stream: "both" });
      if (resp.code !== 0) {
        logger.error("Command %o failed. stdout %s, stderr %s", cmds, resp.stdout, resp.stderr);
        throw <ServiceError> {
          code: Status.INTERNAL,
          message: "Command execution failed.",
        };
      }

      return resp;
    }
  ));

});

