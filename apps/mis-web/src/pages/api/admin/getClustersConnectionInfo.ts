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

import { typeboxRouteSchema } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncClientCall } from "@ddadaal/tsgrpc-client";
import { ConfigServiceClient } from "@scow/protos/build/common/config";
import { Type } from "@sinclair/typebox";
import { authenticate } from "src/auth/server";
import { ClusterConnectionInfo, ClusterConnectionInfoSchema, ClusterConnectionStatus } from "src/models/cluster";
import { PlatformRole } from "src/models/User";
import { getClusterConfigFiles } from "src/server/clusterConfig";
import { getClient } from "src/utils/client";
import { route } from "src/utils/route";

export const GetClustersConnectionInfoSchema = typeboxRouteSchema({

  method: "GET",

  responses: {
    200: Type.Object({
      results: Type.Array(ClusterConnectionInfoSchema),
    }),

  },
});

const auth = authenticate((info) => info.platformRoles.includes(PlatformRole.PLATFORM_ADMIN));

export default route(GetClustersConnectionInfoSchema,
  async (req, res) => {

    const info = await auth(req, res);
    if (!info) {
      return;
    }

    const configClusters = await getClusterConfigFiles();

    const clustersConnectionResp: ClusterConnectionInfo[] = [];
    const client = getClient(ConfigServiceClient);

    await Promise.allSettled(Object.keys(configClusters).map(async (cluster) => {
      const reply = await asyncClientCall(client, "getClusterConfig", { cluster })
        .catch((e) => {
          console.info("Cluster Connection Error ( Cluster ID : %s , Details: %s ) .", cluster, e);
          clustersConnectionResp.push({
            clusterId: cluster,
            connectionStatus: ClusterConnectionStatus.ERROR,
            partitions: [],
          });
        });

      if (reply) {
        clustersConnectionResp.push({
          clusterId: cluster,
          connectionStatus: ClusterConnectionStatus.AVAILABLE,
          schedulerName: reply.schedulerName,
          partitions: reply.partitions,
        });
      }

    }));

    return {
      200: { results: clustersConnectionResp },
    };
  });
