import { NodeSSH } from "node-ssh";
import { runtimeConfig }  from "src/utils/config";

export function getClusterLoginNode(cluster: string): string | undefined {

  const config = runtimeConfig.CLUSTERS_CONFIG[cluster];

  if (!config) { return undefined; }

  return config.loginNodes[0];
}

/**
 * Connect to SSH and returns the SSH Object
 * Must dispose of the object after use
 * @param host host
 * @param username  username
 * @returns SSH Object
 */
export async function sshRawConnect(
  host: string, username: string,
) {

  const ssh = new NodeSSH();

  await ssh.connect({ host, username, privateKey: runtimeConfig.SSH_PRIVATE_KEY_PATH });

  return ssh;
}

export async function sshConnect<T>(
  host: string, username: string, run: (ssh: NodeSSH) => Promise<T>,
) {
  const ssh = await sshRawConnect(host, username);

  return run(ssh).finally(() => { ssh.dispose();});
}

