import { Logger, plugin } from "@ddadaal/tsgrpc-server";
import { ServiceError } from "@grpc/grpc-js";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { NodeSSH, SSHExecOptions } from "node-ssh";
import { config } from "src/config/env";

export interface SshPlugin {
  connect: <T>(addr: string, username: string, logger: Logger,
    run: (ssh: NodeSSH, addr: string) => Promise<T>) => Promise<T>,
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
  } else {
    logger.debug("Command %o completed. stdout %s, stderr %s", [cmd, ...parameters], resp.stdout, resp.stderr);
  }
  return resp;
}


export const sshPlugin = plugin(async (s) => {

  s.addExtension("connect", <SshPlugin["connect"]>(
    async (addr, username, logger, run) => {

      const ssh = new NodeSSH();

      await ssh.connect({ host: addr, username, privateKey: config.SSH_PRIVATE_KEY_PATH });
      logger.info("Connected to %s as %s", addr, username);

      const value = await run(ssh, addr).finally(() => {
        ssh.dispose();
        logger.info("Disconnected from %s as %s", addr, username);
      });

      return value;
    }
  ));
});

