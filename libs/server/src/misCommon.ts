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
import { Logger } from "@ddadaal/tsgrpc-server";
import { ChannelCredentials, ClientOptions } from "@grpc/grpc-js";
import { ClusterConfigSchema } from "@scow/config/build/cluster";
import { ClusterOnlineStatus, ConfigServiceClient } from "@scow/protos/build/server/config";

export type ClientConstructor<TClient> =
new (address: string, credentials: ChannelCredentials, options?: ClientOptions) => TClient;

export const getClientFn = (
  serverUrl: string,
  scowApiAuthToken?: string,
) => <TClient>(
  ctor: ClientConstructor<TClient>,
): TClient => {
  return new ctor(
    serverUrl,
    ChannelCredentials.createInsecure(),
    scowApiAuthToken ?
      {
        callInvocationTransformer: (props) => {
          props.metadata.add("authorization", `Bearer ${scowApiAuthToken}`);
          return props;
        },
      } : undefined,
  );
};

export const libGetClustersOnlineInfo = async (
  logger: Logger,
  configClusters: Record<string, ClusterConfigSchema>,
  misServerUrl?: string,
  scowApiAuthToken?: string,
): Promise<Record<string, ClusterConfigSchema>> => {

  // 判断mis 是否存在
  if (!misServerUrl) {
    return configClusters;
  }
  const getMisClient = getClientFn(misServerUrl, scowApiAuthToken);
  const client = getMisClient(ConfigServiceClient);
  try {
    const reply = await asyncClientCall(client, "getClustersOnlineInfo", {});
    const clustersOnlineInfo = reply.results;

    const currentOnlineClusterIds = clustersOnlineInfo.filter((cluster) => {
      cluster.onlineStatus === ClusterOnlineStatus.ONLINE;
    }).map((cluster) => cluster.clusterId);

    return currentOnlineClusterIds.reduce((acc, clusterId) => {
      if (configClusters[clusterId]) {
        acc[clusterId] = configClusters[clusterId];
      }
      return acc;
    }, {} as Record<string, ClusterConfigSchema>);
  } catch (e: any) {
    logger.warn(e.details);
    return {};
  }
};

