import { slurmAppOps } from "src/clusterops/slurm/app";

export const createSlurmClusterOps = (cluster: string) => ({
  apps: slurmAppOps(cluster),
});