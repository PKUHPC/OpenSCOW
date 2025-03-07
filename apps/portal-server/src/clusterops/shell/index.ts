import { ShellOps } from "src/clusterops/api/shell";
import { configClusters } from "src/config/clusters";
import { clusterNotFound } from "src/utils/errors";
import { getScowdClient } from "src/utils/scowd";
import { getClusterLoginNode } from "src/utils/ssh";

import { scowdShellServices } from "./scowdShell";
import { sshShellServices } from "./sshShell";


export const shellOps = (cluster: string): ShellOps => {

  const clusterInfo = configClusters[cluster];
  if (clusterInfo.scowd?.enabled) {
    const client = getScowdClient(cluster);

    return {
      ...scowdShellServices(client),
    };
  } else {
    const host = getClusterLoginNode(cluster);

    if (!host) { throw clusterNotFound(cluster); }

    return {
      ...sshShellServices(),
    };
  }
};
