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
import { checkSchedulerApiVersion } from "@scow/lib-server";
import { ConfigServiceServer, ConfigServiceService } from "@scow/protos/build/common/config";
import { ConfigServiceServer as runTimeConfigServiceServer, ConfigServiceService as runTimeConfigServiceService }
  from "@scow/protos/build/portal/config";
import { ApiVersion } from "@scow/utils/build/version";
import { callOnOne, checkActivatedClusters } from "src/utils/clusters";

export const staticConfigServiceServer = plugin((server) => {
  return server.addService<ConfigServiceServer>(ConfigServiceService, {

    getClusterConfig: async ({ request, logger }) => {
      const { cluster } = request;
      await checkActivatedClusters({ clusterIds: [cluster], logger });

      const reply = await callOnOne(
        cluster,
        logger,
        async (client) => await asyncClientCall(client.config, "getClusterConfig", {}),
      );

      return [reply];
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
          return await asyncClientCall(client.config, "getClusterInfo", {});
        },
      );

      return [reply];
    },
  });
});
