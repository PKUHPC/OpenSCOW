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
import { ClusterConfigSchema } from "@scow/config/build/cluster";
import { ClusterActivationStatus, ConfigServiceClient } from "@scow/protos/build/server/config";

import { getClientFn } from "./api";

export const libGetCurrentActivatedClusters = async (
  logger: Logger,
  configClusters: Record<string, ClusterConfigSchema>,
  misServerUrl?: string,
  scowApiAuthToken?: string,
): Promise<Record<string, ClusterConfigSchema>> => {

  if (!misServerUrl) {
    logger.info("Mis is not deployed, using clusters from config files.");
    return configClusters;
  }

  const getMisClient = getClientFn(misServerUrl, scowApiAuthToken);
  const client = getMisClient(ConfigServiceClient);

  const reply = await asyncClientCall(client, "getClustersDatabaseInfo", {});
  const clustersDatabaseInfo = reply.results;

  const filteredList = clustersDatabaseInfo.filter((cluster) =>
    cluster.activationStatus === ClusterActivationStatus.ACTIVATED);
  const currentActivatedClusterIds = filteredList.map((cluster) => cluster.clusterId);

  if (currentActivatedClusterIds.length === 0) {
    logger.info("No available activated clusters. %o", clustersDatabaseInfo);
    return {};
  }
  return currentActivatedClusterIds.reduce((acc, clusterId) => {
    if (configClusters[clusterId]) {
      acc[clusterId] = configClusters[clusterId];
    }
    return acc;
  }, {} as Record<string, ClusterConfigSchema>);

};
