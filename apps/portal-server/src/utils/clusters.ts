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

import { ServiceError } from "@ddadaal/tsgrpc-common";
import { status } from "@grpc/grpc-js";
import { getSchedulerAdapterClient, SchedulerAdapterClient } from "@scow/lib-scheduler-adapter";
import { libGetCurrentOnlineClusters } from "@scow/lib-server";
import { scowErrorMetadata } from "@scow/lib-server/build/error";
import { configClusters } from "src/config/clusters";
import { commonConfig } from "src/config/common";
import { config } from "src/config/env";
import { logger as pinoLogger } from "src/utils/logger";
import { Logger } from "ts-log";


const clusters = configClusters;
const adapterClientForClusters = Object.entries(clusters).reduce((prev, [cluster, c]) => {
  const client = getSchedulerAdapterClient(c.adapterUrl);
  prev[cluster] = client;
  return prev;
}, {} as Record<string, SchedulerAdapterClient>);

export const getAdapterClient = (cluster: string) => {
  return adapterClientForClusters[cluster];
};


type CallOnOne = <T>(
  cluster: string,
  logger: Logger,
  call: (client: SchedulerAdapterClient) => Promise<T>,
) => Promise<T>;

export const ADAPTER_CALL_ON_ONE_ERROR = "ADAPTER_CALL_ON_ONE_ERROR";

export const callOnOne: CallOnOne = async (cluster, logger, call) => {

  await checkOnlineClusters({ clusterIds: [cluster], logger });

  const client = getAdapterClient(cluster);

  if (!client) {
    throw new Error("Calling actions on non-existing cluster " + cluster);
  }

  logger.info("Calling actions on cluster " + cluster);

  return await call(client).catch((e) => {
    logger.error("Cluster ops fails at %o", e);

    const clusterErrorDetails = [{
      clusterId: cluster,
      details: e,
    }];

    const reason = "Cluster ID : " + cluster + " Details : " + e;
    throw new ServiceError({
      code: status.INTERNAL,
      details: reason,
      metadata: scowErrorMetadata(ADAPTER_CALL_ON_ONE_ERROR, {
        clusterErrors: clusterErrorDetails.length > 0 ? JSON.stringify(clusterErrorDetails) : "" }),
    });
  });
};


export const NO_ONLINE_CLUSTERS = "NO_ONLINE_CLUSTERS";
export const NOT_EXIST_IN_ONLINE_CLUSTERS = "NOT_EXIST_IN_ONLINE_CLUSTERS";

export const checkOnlineClusters
= async (
  { clusterIds, logger }: {clusterIds: string[], logger: Logger},
) => {

  if (!config.MIS_DEPLOYED) {
    return;
  }

  logger.info("Checking online status of clusters with ids (%o) ", clusterIds);
  const onlineClusters = await libGetCurrentOnlineClusters(
    pinoLogger,
    configClusters,
    config.MIS_SERVER_URL,
    commonConfig.scowApi?.auth?.token);

  if (Object.keys(onlineClusters).length === 0) {
    throw new ServiceError({
      code: status.INTERNAL,
      details: "No available clusters. Please try again later",
      metadata: scowErrorMetadata(NO_ONLINE_CLUSTERS, { currentOnlineClusters: "" }),
    });
  }

  const exist = clusterIds.every((id) => Object.keys(onlineClusters).find((x) => x === id));
  if (!exist) {
    logger.info("Querying offline clusters with ids (%o). The current online clusters' ids: %o",
      clusterIds, Object.keys(onlineClusters));
    throw new ServiceError({
      code: status.INTERNAL,
      details: "Querying offline clusters. Please refresh the page and try again",
      metadata: scowErrorMetadata(NOT_EXIST_IN_ONLINE_CLUSTERS,
        { currentOnlineClusterIds:
          Object.keys(onlineClusters).length > 0 ? JSON.stringify(Object.keys(onlineClusters)) : "" }),
    });
  }

};

