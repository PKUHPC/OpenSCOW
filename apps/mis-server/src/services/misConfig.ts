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

import { asyncClientCall } from "@ddadaal/tsgrpc-client";
import { plugin } from "@ddadaal/tsgrpc-server";
import { ServiceError, status } from "@grpc/grpc-js";
import { ClusterConnectionInfo, ClusterConnectionStatus,
  clusterOnlineStatusFromJSON, ConfigServiceServer, ConfigServiceService } from "@scow/protos/build/server/config";
import { getClustersOnlineInfo } from "src/bl/common";
import { configClusters } from "src/config/clusters";
import { Cluster, ClusterOnlineStatus } from "src/entities/Cluster";

export const misConfigServiceServer = plugin((server) => {
  server.addService<ConfigServiceServer>(ConfigServiceService, {

    /**
     * Deprecated Notice
     * This API function GetAvailablePartitions has been deprecated.
     * Use the new API function GetAvailablePartitionsForCluster instead.
     * @deprecated
     */
    getAvailablePartitions: async ({ request, logger }) => {

      const { accountName, userId } = request;
      const reply = await server.ext.clusters.callOnAll(
        logger,
        async (client) => await asyncClientCall(client.config, "getAvailablePartitions", {
          accountName, userId,
        }),
      );

      const wrappedResult = reply.map((x) => {
        return { cluster: x.cluster, partitions: x.result.partitions };
      });

      return [{ clusterPartitions: wrappedResult } ];
    },


    getAvailablePartitionsForCluster: async ({ request, logger }) => {

      const { cluster, accountName, userId } = request;
      const reply = await server.ext.clusters.callOnOne(
        cluster,
        logger,
        async (client) => await asyncClientCall(client.config, "getAvailablePartitions", {
          accountName, userId,
        }),
      );

      return [reply];
    },

    getClustersConnectionInfo: async ({ logger }) => {

      const clusterResponse: ClusterConnectionInfo[] = [];

      // check connection status of config clusters
      await Promise.allSettled(Object.keys(configClusters).map(async (cluster) => {
        const reply = await server.ext.clusters.callOnOne(
          cluster,
          logger,
          async (client) => await asyncClientCall(client.config, "getClusterConfig", {}),
        ).catch((e) => {
          logger.info("Cluster Connection Error ( Cluster ID : %s , Details: %s ) .", cluster, e);
          clusterResponse.push({
            clusterId: cluster,
            connectionStatus: ClusterConnectionStatus.ERROR,
            partitions: [],
          });
        });

        if (reply) {
          clusterResponse.push({
            clusterId: cluster,
            connectionStatus: ClusterConnectionStatus.AVAILABLE,
            schedulerName: reply.schedulerName,
            partitions: reply.partitions,
          });
        }
      }));

      return [ { results: clusterResponse, totalCount: clusterResponse.length }];
    },

    getClustersOnlineInfo: async ({ em, logger }) => {

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

      return [{ results: reply, totalCount: reply.length }];
    },

    activateCluster: async ({ request, em, logger }) => {
      const { clusterId, operatorId, comment } = request;

      const cluster = await em.findOne(Cluster, { clusterId });

      if (!cluster) {
        throw <ServiceError>{
          code: status.NOT_FOUND, message: `Cluster（ Cluster ID: ${clusterId}） is not found`,
        };
      }

      // 实时判断当前适配器连接状态
      await server.ext.clusters.callOnOne(
        clusterId,
        logger,
        async (client) => await asyncClientCall(client.config, "getClusterConfig", {}),
      ).catch((e) => {
        logger.info("Cluster Connection Error ( Cluster ID : %s , Details: %s ) .", cluster, e);
        throw <ServiceError>{
          code: status.UNIMPLEMENTED,
          message: `Activate cluster failed, Cluster（ Cluster ID: ${clusterId}） is currently unreachable.`,
        };
      });

      if (cluster.onlineStatus === ClusterOnlineStatus.ONLINE) {
        throw <ServiceError>{
          code: status.ALREADY_EXISTS,
          message: `Cluster（ Cluster ID: ${clusterId}） is already activated.`,
        };
      }

      cluster.onlineStatus = ClusterOnlineStatus.ONLINE;
      cluster.operatorId = operatorId;
      if (comment) {
        cluster.comment = comment;
      };

      await em.persistAndFlush(cluster);

      logger.info("Cluster (Cluster ID: %s) is successfully activated by user (User Id: %s) with comment %s",
        clusterId,
        operatorId,
        comment,
      );

      const clustersOnlineInfo = await getClustersOnlineInfo(em, logger);
      const currentOnlineClusters
        = clustersOnlineInfo.filter((x) => x.onlineStatus === clusterOnlineStatusFromJSON(ClusterOnlineStatus.ONLINE));


      return [{ executed: true, currentOnlineClusters }];

    },

    deactivateCluster: async ({ request, em, logger }) => {
      const { clusterId, operatorId, comment } = request;

      const cluster = await em.findOne(Cluster, { clusterId });

      if (!cluster) {
        throw <ServiceError>{
          code: status.NOT_FOUND, message: `Cluster（ Cluster ID: ${clusterId}） is not found`,
        };
      }

      if (cluster.onlineStatus === ClusterOnlineStatus.OFFLINE) {
        throw <ServiceError>{
          code: status.ALREADY_EXISTS,
          message: `Cluster（ Cluster ID: ${clusterId}） is already deactivated.`,
        };
      }

      cluster.onlineStatus = ClusterOnlineStatus.OFFLINE;
      cluster.operatorId = operatorId;
      if (comment) {
        cluster.comment = comment;
      };

      await em.persistAndFlush(cluster);

      logger.info("Cluster (Cluster ID: %s) is successfully deactivated by user (User Id: %s) with comment %s",
        clusterId,
        operatorId,
        comment,
      );

      const clustersOnlineInfo = await getClustersOnlineInfo(em, logger);
      const currentOnlineClusters
       = clustersOnlineInfo.filter((x) => x.onlineStatus === clusterOnlineStatusFromJSON(ClusterOnlineStatus.ONLINE));

      return [{ executed: true, currentOnlineClusters }];

    },

  });
});
