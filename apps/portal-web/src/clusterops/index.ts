import { ClusterOps } from "src/clusterops/api";
import { createSlurmClusterOps } from "src/clusterops/slurm"; 
import { runtimeConfig } from "src/utils/config";

const clusterOpsMaps = {
  "slurm": createSlurmClusterOps,
} as const;

const opsForClusters = Object.keys(runtimeConfig.CLUSTERS_CONFIG).reduce((prev, cluster) => {
  prev[cluster] = clusterOpsMaps[cluster](cluster);
  return prev;
}, {} as Record<string, ClusterOps>);

export const getClusterOps = (cluster: string) => {
  return opsForClusters[cluster];
};
