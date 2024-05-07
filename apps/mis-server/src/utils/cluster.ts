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

export const NO_ACTIVATED_CLUSTERS = "NO_ACTIVATED_CLUSTERS";
export const NOT_EXIST_IN_ACTIVATED_CLUSTERS = "NOT_EXIST_IN_ACTIVATED_CLUSTERS";

export const checkActivatedClusters
= ({ clusterIds, activatedClusters, logger }:
  { clusterIds: string[],
    activatedClusters: Record<string, ClusterConfigSchema>,
    logger: Logger
  }) => {

  logger.info("Checking activation status of clusters with ids (%o) ", clusterIds);
  if (Object.keys(activatedClusters).length === 0) {
    throw new ServiceError({
      code: status.INTERNAL,
      details: "No available clusters. Please try again later",
      metadata: scowErrorMetadata(NO_ACTIVATED_CLUSTERS, { currentActivatedClusters: "" }),
    });
  }

  const exist = clusterIds.every((id) => Object.keys(activatedClusters).find((x) => x === id));
  if (!exist) {
    logger.info("Querying deactivated clusters with ids (%o). The current activated clusters' ids: %o",
      clusterIds, Object.keys(activatedClusters));
    throw new ServiceError({
      code: status.INTERNAL,
      details: "Querying deactivated clusters. Please refresh the page and try again",
      metadata: scowErrorMetadata(NOT_EXIST_IN_ACTIVATED_CLUSTERS,
        { currentActivatedClusterIds:
          Object.keys(activatedClusters).length > 0 ? JSON.stringify(Object.keys(activatedClusters)) : "" }),
    });
  }

};
