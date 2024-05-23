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
import { convertClusterConfigsToServerProtoType, NO_CLUSTERS } from "@scow/lib-server";
import { scowErrorMetadata } from "@scow/lib-server/build/error";
import { ConfigServiceServer, ConfigServiceService } from "@scow/protos/build/common/config";
import { updateCluster } from "src/bl/clustersUtils";

export const configServiceServer = plugin((server) => {
  server.addService<ConfigServiceServer>(ConfigServiceService, {

    // do not need check cluster's activation
    getClusterConfig: async ({ request, logger }) => {
      const { cluster } = request;

      const reply = await server.ext.clusters.callOnOne(
        cluster,
        logger,
        async (client) => await asyncClientCall(client.config, "getClusterConfig", {}),
      );

      return [reply];
    },


    getClusterConfigsInfo: async ({ em, logger }) => {

      const clusterConfigs = getClusterConfigs(undefined, logger);

      const clusterConfigsProto = convertClusterConfigsToServerProtoType(clusterConfigs);

      const currentConfigClusterIds = Object.keys(clusterConfigs);
      if (currentConfigClusterIds.length === 0) {
        throw new ServiceError({
          code: status.INTERNAL,
          details: "Unable to find cluster configuration files. Please contact the system administrator.",
          metadata: scowErrorMetadata(NO_CLUSTERS),
        });
      }
      // update the activation status of cluster in db
      await updateCluster(em, currentConfigClusterIds, logger);

      return [{ clusterConfigs: clusterConfigsProto }];
    },

  });
});
