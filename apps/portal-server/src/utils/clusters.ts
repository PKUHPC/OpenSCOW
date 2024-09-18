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

import { ServiceError } from "@ddadaal/tsgrpc-common";
import { status } from "@grpc/grpc-js";
import { getSchedulerAdapterClient, SchedulerAdapterClient } from "@scow/lib-scheduler-adapter";
import { scowErrorMetadata } from "@scow/lib-server/build/error";
import { libCheckActivatedClusters,
  libGetCurrentActivatedClusters } from "@scow/lib-server/build/misCommon/clustersActivation";
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

  await checkActivatedClusters({ clusterIds: cluster });

  const client = getAdapterClient(cluster);

  if (!client) {
    throw new Error("Calling actions on non-existing cluster " + cluster);
  }

  logger.info("Calling actions on cluster " + cluster);

  return await call(client).catch((e) => {
    logger.error("Cluster ops fails at %o", e);

    const errorDetail = e instanceof Error ? e : JSON.stringify(e);

    const clusterErrorDetails = [{
      clusterId: cluster,
      details: errorDetail,
    }];
    const reason = "Cluster ID : " + cluster + ", Details : " + errorDetail.toString();

    // 统一错误处理
    if (e instanceof Error) {
      throw new ServiceError({
        code: status.INTERNAL,
        details: reason,
        metadata: scowErrorMetadata(ADAPTER_CALL_ON_ONE_ERROR, { clusterErrors: JSON.stringify(clusterErrorDetails) }),
      });
    // 如果是已经封装过的grpc error, 直接抛出错误
    } else {
      throw e;
    }

  });
};

export const checkActivatedClusters
= async (
  { clusterIds }: { clusterIds: string[] | string },
) => {

  if (!config.MIS_DEPLOYED) {
    return;
  }

  const activatedClusters = await libGetCurrentActivatedClusters(
    pinoLogger,
    configClusters,
    config.MIS_SERVER_URL,
    commonConfig.scowApi?.auth?.token);

  return libCheckActivatedClusters({ clusterIds, activatedClusters, logger: pinoLogger });

};

