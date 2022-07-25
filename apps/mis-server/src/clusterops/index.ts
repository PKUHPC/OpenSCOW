import { ClusterOps } from "src/clusterops/api";
import { createSlurmOps } from "src/clusterops/slurm";
import { clusters } from "src/config/clusters";

const clusterOpsMaps = {
  "slurm": createSlurmOps,
} as const;

export const opsForClusters = Object.entries(clusters).reduce((prev, [cluster, c]) => {
  prev[cluster] = { ops: clusterOpsMaps[clusters[cluster].scheduler](cluster), ignore: c.misIgnore };
  return prev;
}, {} as Record<string, { ops: ClusterOps, ignore: boolean } >);

export const getClusterOps = (cluster: string) => {
  return opsForClusters[cluster];
};
