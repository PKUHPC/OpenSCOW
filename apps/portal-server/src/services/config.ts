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
import { ConfigServiceServer, ConfigServiceService } from "@scow/protos/build/common/config";
import { ConfigServiceServer as runTimeConfigServiceServer, ConfigServiceService as runTimeConfigServiceService }
  from "@scow/protos/build/portal/config";
import { GetClusterInfoResponse } from "@scow/scheduler-adapter-protos/build/protos/config";
import { ApiVersion } from "@scow/utils/build/version";
import pino from "pino";
import { checkSchedulerApiVersion, getAdapterClient } from "src/utils/clusters";
import { clusterNotFound } from "src/utils/errors";

export const staticConfigServiceServer = plugin((server) => {
  return server.addService<ConfigServiceServer>(ConfigServiceService, {
    getClusterConfig: async ({ request }) => {
      const { cluster } = request;

      const client = getAdapterClient(cluster);
      if (!client) { throw clusterNotFound(cluster); }

      const reply = await asyncClientCall(client.config, "getClusterConfig", {});

      return [reply];
    },
  });
});

const getClusterInfo = async (cluster: string, logger: pino.Logger<pino.LoggerOptions>) => {
  const client = getAdapterClient(cluster);
  if (!client) {
    logger.error(clusterNotFound(cluster));
    throw cluster;
  }

  // 当前接口要求的最低调度器接口版本
  const minRequiredApiVersion: ApiVersion = { major: 1, minor: 4, patch: 0 };
  // 检验调度器的API版本是否符合要求，不符合要求报错
  await checkSchedulerApiVersion(client, minRequiredApiVersion);

  const reply = await asyncClientCall(client.config, "getClusterInfo", {});

  return reply;
};
export const runtimeConfigServiceServer = plugin((server) => {
  return server.addService<runTimeConfigServiceServer>(runTimeConfigServiceService, {
    getClustersInfo: async ({ request, logger }) => {
      const { clusters } = request;

      const ClustersInfoPromises = clusters.map((x) => getClusterInfo(x, logger));
      const ClustersInfoResults = await Promise.allSettled(ClustersInfoPromises);

      // 处理成功的结果
      const successfulResults = ClustersInfoResults
        .filter((result): result is PromiseFulfilledResult<GetClusterInfoResponse> => result.status === "fulfilled")
        .map((result) => result.value);

      // 收集失败原因
      const rejectedResults = ClustersInfoResults
        .filter((result): result is PromiseRejectedResult =>
          result.status === "rejected",
        )
        .map((result) => result.reason);

      logger.error(rejectedResults);

      const failedClusters: Array<string> = [];
      // 收集失败集群
      ClustersInfoResults.forEach((x, idx) => {
        if (x.status === "rejected") failedClusters.push(clusters[idx]);
      });

      return [{
        clustersInfo:successfulResults,
        failedClusters,
      }];
    },
  });
});
