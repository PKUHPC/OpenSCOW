import { loggedExec, sshConnect as libConnect } from "@scow/lib-ssh";
import type { NodeSSH } from "node-ssh";
import { runtimeConfig } from "src/utils/config";
import { Logger } from "src/utils/log";

export { loggedExec };

export function getClusterLoginNode(cluster: string): string | undefined {

  if (runtimeConfig.LOGIN_NODES[cluster]) { return runtimeConfig.LOGIN_NODES[cluster]; }

  const config = runtimeConfig.CLUSTERS_CONFIG[cluster];

  if (!config) { return undefined; }

  return config.slurm.loginNodes[0];
}

export async function sshConnect<T>(
  address: string, username: string, logger: Logger, run: (ssh: NodeSSH) => Promise<T>,
): Promise<T> {
  return libConnect(address, username, runtimeConfig.ROOT_KEY_PAIR, logger, run);
}
