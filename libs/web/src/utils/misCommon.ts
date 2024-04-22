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

// /**
//  * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
//  * SCOW is licensed under Mulan PSL v2.
//  * You can use this software according to the terms and conditions of the Mulan PSL v2.
//  * You may obtain a copy of Mulan PSL v2 at:
//  *          http://license.coscl.org.cn/MulanPSL2
//  * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
//  * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
//  * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
//  * See the Mulan PSL v2 for more details.
//  */

import { I18nStringType } from "@scow/config/build/i18n";
// import { useState } from "react";

// // import { ClusterOnlineInfo, ClusterOnlineStatus } from "@scow/config/build/common";
// // import { I18nStringType } from "@scow/config/build/i18n";

// export enum ClusterOnlineStatus {
//   ONLINE = 0,
//   OFFLINE = 1,
// }

// export type ClusterOnlineInfo = {
//   comment?: string | undefined;
//   operatorId?: string | undefined;
//   operatorName?: string | undefined;
//   clusterId: string;
//   onlineStatus: ClusterOnlineStatus;
// }
// export type Cluster = { id: string; name: I18nStringType; }

// /**
//  * Format online clusters to cluster config type used in mis-web
//  * @param onlineClusters online status clusters in mis db
//  * @param configClusters clusters from configFile
//  * @returns online clusters matched to cluster config type for mis-web
//  */
// export function getMisWebOnlineClusters(
//   clustersOnlineInfo: ClusterOnlineInfo[],
//   configClusters: {[clusterId: string]: Cluster}): {[clusterId: string]: Cluster} {

//   if (clustersOnlineInfo.length === 0) {
//     return {};
//   }

//   const misWebOnlineClusters: {[clusterId: string]: Cluster} = {};
//   clustersOnlineInfo.forEach((cluster) => {

//     if (cluster.onlineStatus === ClusterOnlineStatus.ONLINE) {
//       misWebOnlineClusters[cluster.clusterId] = configClusters[cluster.clusterId];
//     }

//   });
//   return misWebOnlineClusters;
// }


// export function getPortalWebOnlineClusters(
//   clustersOnlineInfo: ClusterOnlineInfo[],
//   configClusters: Cluster[]): Cluster[] {

//   if (clustersOnlineInfo.length === 0) {
//     return [];
//   }

//   const portalWebOnlineClusters: Cluster[] = [];
//   clustersOnlineInfo.forEach((cluster) => {

//     if (cluster.onlineStatus === ClusterOnlineStatus.ONLINE) {
//       portalWebOnlineClusters.push({ id: cluster.clusterId, name: configClusters[cluster.clusterId].name });
//     }

//   });
//   return portalWebOnlineClusters;
// }
