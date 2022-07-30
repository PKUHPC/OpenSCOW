import { NodeSSH, SSHExecCommandOptions } from "node-ssh";
import type { Logger } from "pino";
import { quote } from "shell-quote";

export interface ConnectOptions {
  address: string;
  username: string;
  privateKeyPath: string;
}

/**
 * Connect to SSH and returns the SSH Object
 * Must dispose of the object after use
 * @param addr address
 * @param username  username
 * @returns SSH Object
 */
export async function sshRawConnect({ address, privateKeyPath, username }: ConnectOptions) {
  const [host, port] = address.split(":");

  const ssh = new NodeSSH();

  await ssh.connect({ host, port: port ? +port : undefined, username, privateKey: privateKeyPath });

  return ssh;
}

export async function sshConnect<T>(
  options: ConnectOptions,
  run: (ssh: NodeSSH) => Promise<T>,
) {
  const ssh = await sshRawConnect(options);

  return run(ssh).finally(() => { ssh.dispose();});
}

/**
 * Construct a command with env prefixes.
 * Some OpenSSH servers don't accept envs
 * This is a workaround by combining the envs to the command
 * @param cmd the command
 * @param parameters the command parameters
 * @param env env
 * @returns command with env prefixes
 */
export function constructCommand(cmd: string, parameters: readonly string[], env?: Record<string, string>) {

  const command = cmd + (parameters.length > 0 ? (" " + quote(parameters)) : "");

  const envPrefix = env ? Object.keys(env).map((x) => `${x}=${quote([env[x] ?? ""])} `).join("") : "";

  return envPrefix + command;
}

export async function loggedExec(ssh: NodeSSH, logger: Logger, throwIfFailed: boolean,
  cmd: string, parameters: string[], options?: SSHExecCommandOptions) {

  const env = options?.execOptions?.env as Record<string, string>;

  const command = constructCommand(cmd, parameters, env);

  const resp = await ssh.execCommand(command, options);

  if (resp.code !== 0) {
    logger.error("Command %o failed. stdout %s, stderr %s", command, resp.stdout, resp.stderr);
    if (throwIfFailed) {
      throw new Error("");
    }
  } else {
    logger.debug("Command %o completed. stdout %s, stderr %s", command, resp.stdout, resp.stderr);
  }
  return resp;
}
