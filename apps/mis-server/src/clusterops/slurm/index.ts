import { Logger } from "@ddadaal/tsgrpc-server";
import { SlurmMisConfigSchema } from "@scow/config/build/appConfig/mis";
import { ClusterOps } from "src/clusterops/api";
import { slurmAccountOps } from "src/clusterops/slurm/account";
import { slurmJobOps } from "src/clusterops/slurm/job";
import { slurmStorageOps } from "src/clusterops/slurm/storage";
import { slurmUserOps } from "src/clusterops/slurm/user";
import { executeSlurmScript } from "src/clusterops/slurm/utils/slurm";
import { clusters } from "src/config/clusters";

export interface SlurmClusterInfo {
  slurmConfig: SlurmMisConfigSchema;
  partitions: string[];

  executeSlurmScript: (params: string[], logger: Logger) => ReturnType<typeof executeSlurmScript>;
}

export const createSlurmOps = (cluster: string, logger: Logger): ClusterOps | undefined => {

  const slurmConfig = clusters[cluster].slurm;

  if (!slurmConfig) {
    throw new Error(`the slurm property of cluster ${cluster} in clusters/${cluster}.yaml is not set.`);
  }

  const slurmMisConfig = slurmConfig.mis;

  if (!slurmMisConfig) {
    logger.warn("the slurm.mis property of cluster %s is not set. Ignore the cluster.", cluster);
    return undefined;
  }

  const partitions = Object.keys(slurmConfig.partitions);

  const clusterInfo: SlurmClusterInfo = {
    partitions,
    slurmConfig: slurmMisConfig,
    executeSlurmScript: (params, logger) => executeSlurmScript(slurmMisConfig, partitions, params, logger),
  };

  return {
    account: slurmAccountOps(clusterInfo),
    storage: slurmStorageOps(clusterInfo),
    job:  slurmJobOps(clusterInfo),
    user: slurmUserOps(clusterInfo),
  };

};
