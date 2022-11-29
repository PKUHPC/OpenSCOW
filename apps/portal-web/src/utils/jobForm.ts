/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * SCOW is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

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
