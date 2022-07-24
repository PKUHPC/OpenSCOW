import { ClusterOps } from "src/clusterops/api";
import { createSlurmOps } from "src/clusterops/slurm";
import { clusters } from "src/config/clusters";
import { misConfig } from "src/config/mis";

const clusterOpsMaps = {
  "slurm": createSlurmOps,
} as const;

export const opsForClusters = Object.entries(misConfig.clusters).reduce((prev, [cluster, c]) => {
  prev[cluster] = { ops: clusterOpsMaps[clusters[cluster].scheduler](cluster), ignore: c.ignore };
  return prev;
}, {} as Record<string, { ops: ClusterOps, ignore: boolean } >);

export const getClusterOps = (cluster: string) => {
  return opsForClusters[cluster];
};
