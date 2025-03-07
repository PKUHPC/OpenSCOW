import { JobOps } from "src/clusterops/api/job";
import { configClusters } from "src/config/clusters";
import { clusterNotFound } from "src/utils/errors";
import { getScowdClient } from "src/utils/scowd";
import { getClusterLoginNode } from "src/utils/ssh";

import { scowdJobServices } from "./scowdJob";
import { sshJobServices } from "./sshJob";

export interface JobMetadata {
  jobName: string;
  account: string;
  partition?: string;
  qos?: string;
  nodeCount: number;
  coreCount: number;
  gpuCount?: number;
  maxTime: number;
  command: string;
  comment?: string;
  submitTime: string;
  workingDirectory: string;
  memory?: string;
}

export const jobOps = (cluster: string): JobOps => {

  const clusterInfo = configClusters[cluster];
  if (clusterInfo.scowd?.enabled) {
    const client = getScowdClient(cluster);

    return {
      ...scowdJobServices(client),
    };
  } else {
    const host = getClusterLoginNode(cluster);

    if (!host) { throw clusterNotFound(cluster); }

    return {
      ...sshJobServices(host),
    };
  }
};
