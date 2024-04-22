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
import { ClusterOnlineInfo, ConfigServiceClient } from "@scow/protos/build/server/config";
import { getClientFn } from "src/utils/api";

// export type ClientConstructor<TClient> =
// new (address: string, credentials: ChannelCredentials, options?: ClientOptions) => TClient;

// export const getClientFn = (
//   serverUrl: string,
//   scowApiAuthToken?: string,
// ) => <TClient>(
//   ctor: ClientConstructor<TClient>,
// ): TClient => {
//   return new ctor(
//     serverUrl,
//     ChannelCredentials.createInsecure(),
//     scowApiAuthToken ?
//       {
//         callInvocationTransformer: (props) => {
//           props.metadata.add("authorization", `Bearer ${scowApiAuthToken}`);
//           return props;
//         },
//       } : undefined,
//   );
// };

export const libGetClustersOnlineInfo = async (
  // logger: Logger,
  // configClusters: Record<string, ClusterConfigSchema>,
  // configClusters: Cluster[],
  misServerUrl?: string,
  scowApiAuthToken?: string,
// ): Promise<Record<string, ClusterConfigSchema>> => {
): Promise<ClusterOnlineInfo[]> => {

  // 判断 管理系统 是否存在
  if (!misServerUrl) {
    return [];
  }

  const config = {
    SERVER_URL: misServerUrl,
    SCOW_API_AUTH_TOKEN: scowApiAuthToken,
  };
  const getMisClient = getClientFn(config);
  const client = getMisClient(ConfigServiceClient);
  try {

    const reply = await asyncClientCall(client, "getClustersOnlineInfo", {});
    return reply.results;
    // const currentOnlineClusterIds = clustersOnlineInfo.filter((cluster) => {
    //   cluster.onlineStatus === ClusterOnlineStatus.ONLINE;
    // }).map((cluster) => cluster.clusterId);

    // return currentOnlineClusterIds.reduce((acc, clusterId) => {
    //   if (configClusters[clusterId]) {
    //     acc[clusterId] = configClusters[clusterId];
    //   }
    //   return acc;
    // }, {} as Record<string, ClusterConfigSchema>);
  } catch (e: any) {
    console.log(e.details);
    return [];
  }
};

