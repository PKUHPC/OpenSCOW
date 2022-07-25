import { NodeSSH, SSHExecCommandOptions } from "node-ssh";
import { quote } from "shell-quote";
import { runtimeConfig }  from "src/utils/config";
import { Logger } from "src/utils/log";

export function getClusterLoginNode(cluster: string): string | undefined {

  if (runtimeConfig.FILE_SERVERS[cluster]) { return runtimeConfig.FILE_SERVERS[cluster]; }

  const config = runtimeConfig.CLUSTERS_CONFIG[cluster];

  if (!config) { return undefined; }

  return config.slurm.loginNodes[0];
}

/**
 * Connect to SSH and returns the SSH Object
 * Must dispose of the object after use
 * @param addr address
 * @param username  username
 * @returns SSH Object
 */
export async function sshRawConnect(
  addr: string, username: string,
) {
  const [host, port] = addr.split(":");

  const ssh = new NodeSSH();

  await ssh.connect({ host, port: port ? +port : undefined, username, privateKey: runtimeConfig.SSH_PRIVATE_KEY_PATH });

  return ssh;
}

export async function sshConnect<T>(
  addr: string, username: string, logger: Logger, run: (ssh: NodeSSH) => Promise<T>,
) {
  const ssh = await sshRawConnect(addr, username);

  return run(ssh).finally(() => { ssh.dispose();});
}

export async function sshRmrf(ssh: NodeSSH, path: string) {
  await ssh.exec("rm", ["-rf", path]);
}

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
    // logger.error("Command %o failed. stdout %s, stderr %s", command, resp.stdout, resp.stderr);
    if (throwIfFailed) {
      throw new Error("");
    }
  } else {
    // logger.debug("Command %o completed. stdout %s, stderr %s", command, resp.stdout, resp.stderr);
  }
  return resp;
}
