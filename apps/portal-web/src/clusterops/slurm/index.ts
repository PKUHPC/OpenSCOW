import { ClusterOps } from "src/clusterops/api";
import { slurmAppOps } from "src/clusterops/slurm/app";
import { slurmJobOps } from "src/clusterops/slurm/job";

export const createSlurmClusterOps = (cluster: string): ClusterOps => ({
  app: slurmAppOps(cluster),
  job: slurmJobOps(cluster),
});