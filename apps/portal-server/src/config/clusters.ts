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

import { getClusterConfigs } from "@scow/config/build/cluster";
import { libGetClustersOnlineInfo } from "@scow/lib-server";
import { logger } from "src/utils/logger";

import { commonConfig } from "./common";
import { config } from "./env";

export const configClusters = getClusterConfigs(undefined, logger, ["hpc"]);

export const currentClusters = async () => {

  // if mis-server is deployed
  if (config.MIS_DEPLOYED) {


    const onlineClusters
       = await libGetClustersOnlineInfo(logger, configClusters,
         config.MIS_SERVER_URL, commonConfig.scowApi?.auth?.token);
    logger.info("Current online clusters (when mis deployed): %o", onlineClusters);
    return onlineClusters;
  } else {
    return configClusters;
  }
};

