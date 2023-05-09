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
import { logger } from "src/utils/logger";

export const clusters = getClusterConfigs(undefined, logger);


// // map slurm cluster id to scow cluster id
// export const clusterIdMap = Object.entries(clusters).reduce((prev, [key, value]) => {
//   if (value.scheduler === "slurm" && value.slurm && value.slurm.mis) {
//     prev[value.slurm.mis.clusterName] = key;
//   }
//   return prev;
// }, { } as Record<string, string>);

// export function clusterNameToScowClusterId(clusterName: string) {
//   return clusterIdMap[clusterName];
// }
