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
import { ClusterConfigSchema } from "@scow/config/build/cluster";
import { scowErrorMetadata } from "@scow/lib-server/build/error";
import { Logger } from "pino";

export const NO_ONLINE_CLUSTERS = "NO_ONLINE_CLUSTERS";
export const NOT_EXIST_IN_ONLINE_CLUSTERS = "NOT_EXIST_IN_ONLINE_CLUSTERS";

export const checkOnlineClusters
= async (
  { clusterIds,
    onlineClusters,
    logger,
  }:
  { clusterIds: string[],
    onlineClusters: Record<string, ClusterConfigSchema>,
    logger: Logger
  },
) => {

  logger.info("Checking online status of clusters with ids (%o) ", clusterIds);
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

