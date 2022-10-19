import { loggedExec, sshConnect as libConnect } from "@scow/lib-ssh";
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
