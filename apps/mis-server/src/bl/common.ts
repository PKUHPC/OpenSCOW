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

import { Logger } from "@ddadaal/tsgrpc-server";
import { MySqlDriver, SqlEntityManager } from "@mikro-orm/mysql";
import { ClusterConfigSchema } from "@scow/config/build/cluster";
import { ClusterOnlineInfo, clusterOnlineStatusFromJSON } from "@scow/protos/build/server/config";
import { Cluster } from "src/entities/Cluster";

export async function updateCluster(
  em: SqlEntityManager<MySqlDriver>,
  configClusterIds: string[],
  logger: Logger,
): Promise<void> {

  logger.info("Update Cluster");
  logger.info("Check and update online clusters started.");

  const clusterOnlineData = await em.findAll(Cluster, {});
  const existingClusterIds = clusterOnlineData.map((item) => item.clusterId);
  logger.info(`Existing Clusters: ${existingClusterIds.length}`);
  // const configClusterIds = Object.keys(clusters);
  logger.info(`Config Clusters: ${configClusterIds.length}`);

  // Delete non-exist cluster IDs from the database
  const shouldDeleteClusters = clusterOnlineData.filter((cluster) => !configClusterIds.includes(cluster.clusterId));
  if (shouldDeleteClusters.length > 0) {
    logger.info("Delete clusters: ( Cluster IDs: %s ) from the database that is not existed in the config file.",
      shouldDeleteClusters.map((x) => x.clusterId));
    em.removeAndFlush([shouldDeleteClusters]);
  }

  // Write new records for new cluster IDs
  const shouldCreateClusterIds = configClusterIds.filter((id) => !existingClusterIds.includes(id));
  if (shouldCreateClusterIds.length > 0) {
    logger.info("Start Create clusters");
    shouldCreateClusterIds.forEach(async (id) => {
      logger.info("To insert clusterId: %s", id);
      const newCluster = new Cluster({
        clusterId: id,
      });
      logger.info("Create cluster: ( Cluster ID: %s ) in the config file.", id);
      em.persistAndFlush(newCluster);
    });
  }


}


export async function getClustersOnlineInfo(
  em: SqlEntityManager<MySqlDriver>,
  logger: Logger,
): Promise<ClusterOnlineInfo[]> {

  logger.info("Get current clusters online info started.");

  const clusterOnlineData = await em.findAll(Cluster, {});

  const reply = clusterOnlineData.map((x) => {
    return {
      clusterId: x.clusterId,
      onlineStatus: clusterOnlineStatusFromJSON(x.onlineStatus),
      operatorId: x.operatorId,
      comment: x.comment,
    };
  });

  const clusterOnlineStatusList = reply.map((x) => {
    return `(Cluster ID: ${x.clusterId}) : ${x.onlineStatus}`;
  }).join("; ");

  logger.info("Current clusters list: %s", clusterOnlineStatusList);

  return reply;
}

// export async function getOnlineClusters(em: SqlEntityManager<MySqlDriver>,
//   logger: Logger): Promise<Record<string, ClusterConfigSchema>>) {
//   const clustersOnlineInfo = await getClustersOnlineInfo(f.ext.orm.em.fork(), logger);
//   const currentOnlineClusterIds = clustersOnlineInfo.filter((cluster) => {
//     cluster.onlineStatus === ClusterOnlineStatus.ONLINE;
//   }).map((cluster) => cluster.clusterId);

//   return currentOnlineClusterIds.reduce((acc, clusterId) => {
//     if (configClusters[clusterId]) {
//       acc[clusterId] = configClusters[clusterId];
//     }
//     return acc;
//   }, {} as Record<string, ClusterConfigSchema>);
// };

