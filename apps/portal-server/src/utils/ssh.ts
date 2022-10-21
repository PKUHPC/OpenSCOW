import { loggedExec, sshConnect as libConnect, testRootUserSshLogin } from "@scow/lib-ssh";
import type { NodeSSH } from "node-ssh";
import { clusters } from "src/config/clusters";
import { rootKeyPair } from "src/config/env";
import { Logger } from "ts-log";

export { loggedExec };

export function getClusterLoginNode(cluster: string): string | undefined {

  return clusters[cluster]?.slurm?.loginNodes?.[0];
}

export async function sshConnect<T>(
  address: string, username: string, logger: Logger, run: (ssh: NodeSSH) => Promise<T>,
): Promise<T> {
  return libConnect(address, username, rootKeyPair, logger, run);
}

/**
 * Check whether all clusters can be logged in as root user
 */
export async function checkClustersRootUserLogin(logger: Logger) {
  await Promise.all(Object.values(clusters).map(async ({ displayName, slurm: { loginNodes } }) => {
    const node = loginNodes[0];
    logger.info("Checking if root can login to %s by login node %s", displayName, node);
    const error = await testRootUserSshLogin(node, rootKeyPair, console);
    if (error) {
      logger.info("Root cannot login to %s by login node %s. err: %o", displayName, node, error);
      throw error;
    } else {
      logger.info("Root can login to %s by login node %s", displayName, node);
    }
  }));
}
