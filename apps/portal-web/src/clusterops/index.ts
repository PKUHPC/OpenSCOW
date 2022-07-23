import { ClusterOps } from "src/clusterops/api";
import { createSlurmClusterOps } from "src/clusterops/slurm";
import { runtimeConfig } from "src/utils/config";

const clusterOpsMaps = {
  "slurm": createSlurmClusterOps,
} as const;

const opsForClusters = Object.entries(runtimeConfig.CLUSTERS_CONFIG).reduce((prev, [cluster, c]) => {
  prev[cluster] = clusterOpsMaps[c.scheduler](cluster);
  return prev;
}, {} as Record<string, ClusterOps>);

export const getClusterOps = (cluster: string) => {
  return opsForClusters[cluster];
};
