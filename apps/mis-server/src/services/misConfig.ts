/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * OpenSCOW is licensed under Mulan PSL v2.
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
import { getLoginNode } from "@scow/config/build/cluster";
import { testRootUserSshLogin } from "@scow/lib-ssh";
import { ClusterRuntimeInfo_LastActivationOperation,
  ConfigServiceServer, ConfigServiceService } from "@scow/protos/build/server/config";
import { getActivatedClusters, getClustersRuntimeInfo } from "src/bl/clustersUtils";
import { configClusters } from "src/config/clusters";
import { rootKeyPair } from "src/config/env";
import { Cluster, ClusterActivationStatus } from "src/entities/Cluster";

export const misConfigServiceServer = plugin((server) => {
  server.addService<ConfigServiceServer>(ConfigServiceService, {

    /**
     * Deprecated Notice
     * This API function GetAvailablePartitions has been deprecated.
     * Use the new API function GetAvailablePartitionsForCluster instead.
     * @deprecated
     */
    getAvailablePartitions: async ({ request, em, logger }) => {

      const { accountName, userId } = request;
      const currentActivatedClusters = await getActivatedClusters(em, logger).catch();
      const reply = await server.ext.clusters.callOnAll(
        currentActivatedClusters,
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


    /**
     * @deprecated Use the new API function GetAvailablePartitionsForCluster from ./config/configServiceServer instead.
     */
    getAvailablePartitionsForCluster: async ({ request, logger }) => {

      const { cluster, accountName, userId } = request;
      // do not need check cluster's activation
      const reply = await server.ext.clusters.callOnOne(
        cluster,
        logger,
        async (client) => await asyncClientCall(client.config, "getAvailablePartitions", {
          accountName, userId,
        }),
      );

      return [reply];
    },

    getClustersRuntimeInfo: async ({ em, logger }) => {

      const reply = await getClustersRuntimeInfo(em, logger);

      return [{ results: reply }];
    },

    activateCluster: async ({ request, em, logger }) => {
      const { clusterId, operatorId } = request;

      return await em.transactional(async (em) => {
        const cluster = await em.findOne(Cluster, { clusterId });

        if (!cluster) {
          throw {
            code: status.NOT_FOUND, message: `Cluster（ Cluster ID: ${clusterId}） is not found`,
          } as ServiceError;
        }

        // check current scheduler adapter connection state
        // do not need check cluster's activation
        await server.ext.clusters.callOnOne(
          clusterId,
          logger,
          async (client) => await asyncClientCall(client.config, "getClusterConfig", {}),
        ).catch((e) => {
          logger.info("Cluster Connection Error ( Cluster ID : %s , Details: %s ) .", cluster, e);
          throw {
            code: status.FAILED_PRECONDITION,
            message: `Activate cluster failed, Cluster（ Cluster ID: ${clusterId}） is currently unreachable.`,
          } as ServiceError;
        });

        // when the cluster has already been activated
        if (cluster.activationStatus === ClusterActivationStatus.ACTIVATED) {
          logger.info("Cluster (Cluster ID: %s) has already been activated",
            clusterId,
          );
          return [{ executed: false }];
        }

        // check root user ssh login in the target cluster
        const targetClusterLoginNodes = configClusters[clusterId].loginNodes;

        const loginNode = getLoginNode(targetClusterLoginNodes[0]);
        const address = loginNode.address;
        const node = loginNode.name;
        logger.info("Checking if root can login to cluster (clusterId: %s) by login node %s",
          clusterId, node);
        const error = await testRootUserSshLogin(address, rootKeyPair, logger);

        if (error) {
          logger.info("Root cannot login to cluster (clusterId: %s) by login node %s. err: %o",
            clusterId, node, error);
          throw {
            code: status.FAILED_PRECONDITION,
            message: `Activate cluster failed, root login check failed in Cluster（ Cluster ID: ${clusterId}） .`,
          } as ServiceError;
        } else {
          logger.info("Root can login to cluster (clusterId: %s) by login node %s", clusterId, node);
        }

        cluster.activationStatus = ClusterActivationStatus.ACTIVATED;

        // save operator userId in lastActivationOperation
        const lastActivationOperationMap: ClusterRuntimeInfo_LastActivationOperation = {};

        lastActivationOperationMap.operatorId = operatorId;
        cluster.lastActivationOperation = lastActivationOperationMap;

        await em.persistAndFlush(cluster);

        logger.info("Cluster (Cluster ID: %s) is successfully activated by user (User Id: %s)",
          clusterId,
          operatorId,
        );


        return [{ executed: true }];

      });

    },

    deactivateCluster: async ({ request, em, logger }) => {
      const { clusterId, operatorId, deactivationComment } = request;

      const cluster = await em.findOne(Cluster, { clusterId });

      if (!cluster) {
        throw {
          code: status.NOT_FOUND, message: `Cluster（ Cluster ID: ${clusterId}） is not found`,
        } as ServiceError;
      }

      if (cluster.activationStatus === ClusterActivationStatus.DEACTIVATED) {

        logger.info("Cluster (Cluster ID: %s) has already been deactivated");

        return [{ executed: false }];
      }

      cluster.activationStatus = ClusterActivationStatus.DEACTIVATED;

      // save operator userId and deactivation in lastActivationOperation
      const lastActivationOperationMap: ClusterRuntimeInfo_LastActivationOperation = {};
      lastActivationOperationMap.operatorId = operatorId;

      if (deactivationComment) {
        lastActivationOperationMap.deactivationComment = deactivationComment;
      }
      cluster.lastActivationOperation = lastActivationOperationMap;


      await em.persistAndFlush(cluster);

      logger.info("Cluster (Cluster ID: %s) is successfully deactivated by user (User Id: %s) with comment %s",
        clusterId,
        operatorId,
        deactivationComment,
      );

      return [{ executed: true }];

    },

  });
});
