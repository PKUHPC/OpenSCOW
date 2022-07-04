import { NodeSSH } from "node-ssh";
import { runtimeConfig }  from "src/utils/config";

export function getClusterLoginNode(cluster: string): string | undefined {

  if (runtimeConfig.FILE_SERVERS[cluster]) { return runtimeConfig.FILE_SERVERS[cluster]; }

  const config = runtimeConfig.CLUSTERS_CONFIG[cluster];

  if (!config) { return undefined; }

  return config.loginNodes[0];
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
  addr: string, username: string, run: (ssh: NodeSSH) => Promise<T>,
) {
  const ssh = await sshRawConnect(addr, username);

  return run(ssh).finally(() => { ssh.dispose();});
}

export async function sshRmrf(ssh: NodeSSH, path: string) {
  await ssh.exec("rm", ["-rf", path]);
}
