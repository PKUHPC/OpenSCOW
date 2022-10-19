import { ClusterOps } from "src/clusterops/api";
import { createSlurmClusterOps } from "src/clusterops/slurm";
import { clusters } from "src/config/clusters";

const clusterOpsMaps = {
  "slurm": createSlurmClusterOps,
} as const;

const opsForClusters = Object.entries(clusters).reduce((prev, [cluster, c]) => {
  prev[cluster] = clusterOpsMaps[c.scheduler](cluster);
  return prev;
}, {} as Record<string, ClusterOps>);

export const getClusterOps = (cluster: string) => {
  return opsForClusters[cluster];
};
