import { loggedExec, sshConnect as libConnect } from "@scow/lib-ssh";
import type { NodeSSH } from "node-ssh";
import { runtimeConfig }  from "src/utils/config";

export { loggedExec };

export function getClusterLoginNode(cluster: string): string | undefined {

  if (runtimeConfig.LOGIN_NODES[cluster]) { return runtimeConfig.LOGIN_NODES[cluster]; }

  const config = runtimeConfig.CLUSTERS_CONFIG[cluster];

  if (!config) { return undefined; }

  return config.slurm.loginNodes[0];
}

export async function sshConnect<T>(address: string, username: string, run: (ssh: NodeSSH) => Promise<T>): Promise<T> {
  return libConnect(address, username, runtimeConfig.SSH_PRIVATE_KEY_PATH, run);
}
