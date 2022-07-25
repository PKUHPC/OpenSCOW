import { Cluster, publicConfig } from "src/utils/config";

export const getPartitionInfo = (cluster: Cluster, partition: string | undefined) => {
  return partition
    ? publicConfig.CLUSTERS_CONFIG[cluster.id].slurm.partitions[partition]
    : undefined;
};

export function firstPartition(cluster: Cluster) {
  const partitionName = Object.keys(publicConfig.CLUSTERS_CONFIG[cluster.id].slurm.partitions)[0];
  return [partitionName, getPartitionInfo(cluster, partitionName)] as const;
}
