import { Logger } from "@ddadaal/tsgrpc-server";
import { ServiceError } from "@grpc/grpc-js";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { NodeSSH, SSHExecCommandOptions } from "node-ssh";
import { quote } from "shell-quote";
import { config } from "src/config/env";

export interface SshPlugin {
  connect: <T>(addr: string, username: string, logger: Logger,
    run: (ssh: NodeSSH, addr: string) => Promise<T>) => Promise<T>,
}

export function constructCommand(cmd: string, parameters: readonly string[], env?: NodeJS.ProcessEnv) {

  const command = cmd + (parameters.length > 0 ? (" " + quote(parameters)) : "");

  const envPrefix = env ? Object.keys(env).map((x) => `${x}=${quote([env[x] ?? ""])} `).join("") : "";

  return envPrefix + command;
}

export async function loggedExec(ssh: NodeSSH, logger: Logger, throwIfFailed: boolean,
  cmd: string, parameters: string[], options?: SSHExecCommandOptions) {

  const env = options?.execOptions?.env;

  const command = constructCommand(cmd, parameters, env);

  const resp = await ssh.execCommand(command, options);

  if (resp.code !== 0) {
    logger.error("Command %o failed. stdout %s, stderr %s", command, resp.stdout, resp.stderr);
    if (throwIfFailed) {
      throw <ServiceError> {
        code: Status.INTERNAL,
        message: "Command execution failed.",
      };
    }
  } else {
    logger.debug("Command %o completed. stdout %s, stderr %s", command, resp.stdout, resp.stderr);
  }
  return resp;
}

export async function sshConnect<T>(
  host: string, username: string, logger: Logger,
  run: (ssh: NodeSSH, addr: string) => Promise<T>,
) {
  const ssh = new NodeSSH();

  await ssh.connect({ host, username, privateKey: config.SSH_PRIVATE_KEY_PATH });
  logger.debug("Connected to %s as %s", host, username);

  const value = await run(ssh, host).finally(() => {
    ssh.dispose();
    logger.debug("Disconnected from %s as %s", host, username);
  });

  return value;
}
