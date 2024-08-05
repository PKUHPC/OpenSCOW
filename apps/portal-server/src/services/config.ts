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
import { ServiceError } from "@ddadaal/tsgrpc-common";
import { plugin } from "@ddadaal/tsgrpc-server";
import { status } from "@grpc/grpc-js";
import { getClusterConfigs } from "@scow/config/build/cluster";
import { checkSchedulerApiVersion, convertClusterConfigsToServerProtoType, NO_CLUSTERS } from "@scow/lib-server";
import { scowErrorMetadata } from "@scow/lib-server/build/error";
import { ConfigServiceServer, ConfigServiceService, Partition } from "@scow/protos/build/common/config";
import { ConfigServiceServer as runTimeConfigServiceServer, ConfigServiceService as runTimeConfigServiceService }
  from "@scow/protos/build/portal/config";
import { ApiVersion } from "@scow/utils/build/version";
import { readFileSync } from "fs";
import { join } from "path";
import { callOnOne, checkActivatedClusters } from "src/utils/clusters";

export const staticConfigServiceServer = plugin((server) => {
  return server.addService<ConfigServiceServer>(ConfigServiceService, {
    getClusterConfig: async ({ request, logger }) => {
      const { cluster } = request;
      await checkActivatedClusters({ clusterIds: cluster });

      const reply = await callOnOne(
        cluster,
        logger,
        async (client) => await asyncClientCall(client.config, "getClusterConfig", {}),
      );

      return [reply];
    },

    getAvailablePartitionsForCluster: async ({ request, logger }) => {

      const { cluster, accountName, userId } = request;
      let availablePartitions: Partition[];

      await checkActivatedClusters({ clusterIds: cluster });

      try {
        const resp = await callOnOne(
          cluster,
          logger,
          async (client) => await asyncClientCall(client.config, "getAvailablePartitions", {
            accountName, userId,
          }),
        );
        availablePartitions = resp.partitions;
      } catch (error) {
        logger.error(
          "Error occured when query the available partitions of %s in %s. Error %o",
          userId, accountName, error,
        );
        availablePartitions = [];
      }

      return [{ partitions: availablePartitions }];
    },

    getClusterConfigFiles: async ({ logger }) => {

      const clusterConfigs = getClusterConfigs(undefined, logger, ["hpc"]);

      const currentConfigClusterIds = Object.keys(clusterConfigs);
      if (currentConfigClusterIds.length === 0) {
        throw new ServiceError({
          code: status.INTERNAL,
          details: "Unable to find cluster configuration files. Please contact the system administrator.",
          metadata: scowErrorMetadata(NO_CLUSTERS),
        });
      }

      const clusterConfigsProto = convertClusterConfigsToServerProtoType(clusterConfigs);

      return [{ clusterConfigs: clusterConfigsProto }];
    },

    getApiVersion: async () => {

      const version = await JSON.parse(readFileSync(join(__dirname,
        "../../node_modules/@scow/protos/package.json"), "utf-8")).version;

      const [major, minor, patch] = version.split(".").map(Number);

      return [{ major, minor, patch }];
    },
  });
});

export const runtimeConfigServiceServer = plugin((server) => {
  return server.addService<runTimeConfigServiceServer>(runTimeConfigServiceService, {
    getClusterInfo: async ({ request, logger }) => {

      const { cluster } = request;

      const reply = await callOnOne(
        cluster,
        logger,
        async (client) => {
          // 当前接口要求的最低调度器接口版本
          const minRequiredApiVersion: ApiVersion = { major: 1, minor: 4, patch: 0 };
          // 检验调度器的API版本是否符合要求，不符合要求报错
          await checkSchedulerApiVersion(client, minRequiredApiVersion);
          return await asyncClientCall(client.config, "getClusterInfo", request);
        },
      );

      return [reply];
    },

    getClusterNodesInfo: async ({ request, logger }) => {
      const { nodeNames,cluster } = request;

      const reply = await callOnOne(
        cluster,
        logger,
        async (client) => {
          // 当前接口要求的最低调度器接口版本
          const minRequiredApiVersion: ApiVersion = { major: 1, minor: 6, patch: 0 };
          // 检验调度器的API版本是否符合要求，不符合要求报错
          await checkSchedulerApiVersion(client, minRequiredApiVersion);
          return await asyncClientCall(client.config, "getClusterNodesInfo", {
            nodeNames: nodeNames || [],
          });
        },
      );
      return [{ nodes: reply.nodes }];
    },
  });
});
