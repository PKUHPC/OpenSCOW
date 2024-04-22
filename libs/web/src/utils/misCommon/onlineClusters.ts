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

import { Cluster, ClusterOnlineInfo, ClusterOnlineStatus } from "@scow/config/build/type";
import { useState } from "react";


// import { ClusterOnlineInfo, ClusterOnlineStatus } from "@scow/config/build/common";
// import { I18nStringType } from "@scow/config/build/i18n";

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
//  * @param clustersOnlineInfo clusters in mis db
//  * @param configClusters clusters from config file
//  * @returns
//  */
// export function formatMisOnlineClusters(
//   clustersOnlineInfo: ClusterOnlineInfo[],
//   configClusters: {[clusterId: string]: Cluster},
// ): {[clusterId: string]: Cluster} {

//   if (clustersOnlineInfo.length === 0) {
//     return {};
//   }

//   const misOnlineClusters: {[clusterId: string]: Cluster} = {};
//   clustersOnlineInfo.forEach((x) => {
//     if (x.onlineStatus === ClusterOnlineStatus.ONLINE) {
//       misOnlineClusters[x.clusterId] = configClusters[x.clusterId];
//     }
//   });
//   return misOnlineClusters;
// }

// /**
//  * Format online clusters to cluster config type used in portal-web
//  * @param clustersOnlineInfo clusters in mis db
//  * @param configClusters clusters from config file
//  * @returns
//  */
// export function formatPortalOnlineClusters(
//   clustersOnlineInfo: ClusterOnlineInfo[],
//   configClusters: Cluster[],
//   misDeployed: boolean,
// ): Cluster[] {

//   if (!misDeployed) {
//     return configClusters;
//   }

//   if (clustersOnlineInfo.length === 0) {
//     return [];
//   }

//   const portalOnlineClusters: Cluster[] = [];
//   clustersOnlineInfo.forEach((x) => {
//     if (x.onlineStatus === ClusterOnlineStatus.ONLINE) {
//       const onlineCluster = configClusters.find((c) => c.id === x.clusterId);
//       if (onlineCluster) {
//         portalOnlineClusters.push(onlineCluster);
//       }
//     }
//   });
//   return portalOnlineClusters;


export function formatOnlineClusters(
  clustersFromDatabase: ClusterOnlineInfo[],
  configClusters: {[clusterId: string]: Cluster} | Cluster[],
  misDeployed: boolean = true,
): {[clusterId: string]: Cluster} | Cluster[] {

  // if misDeployed is false, use config clusters
  if (!misDeployed) {
    return configClusters;
  }

  if (!clustersFromDatabase || clustersFromDatabase.length === 0) {
    return Array.isArray(configClusters) ? [] : {};
  }

  const isPortalWeb = Array.isArray(configClusters);
  // if config clusters is from mis, which type is Cluster[]
  if (isPortalWeb) {
    return configClusters.filter((cluster) =>
      clustersFromDatabase.find((x) => x.onlineStatus === ClusterOnlineStatus.ONLINE && x.clusterId === cluster.id),
    );
    // if config clusters is from mis, which type is {[clusterId: string]: Cluster}
  } else {
    const formattedOnlineClusters: {[clusterId: string]: Cluster} = {};

    clustersFromDatabase.forEach((x) => {
      if (x.onlineStatus === ClusterOnlineStatus.ONLINE) {
        formattedOnlineClusters[x.clusterId] = configClusters[x.clusterId];
      }
    });

    return formattedOnlineClusters;
  }

}

export function CurrentOnlineClustersStore(
  initialCurrentClusters: {[clusterId: string]: Cluster} | Cluster[],
  // configClusters: {[clusterId: string]: Cluster} | Cluster[],
  // misDeployed: boolean = true,
  // misServerUrl?: string,
  // scowApiAuthToken?: string,
) {


  const [currentClusters, setCurrentClusters]
   = useState<{[clusterId: string]: Cluster} | Cluster[]>(initialCurrentClusters);

  // useEffect(() => {
  //   if (misDeployed) {
  //     const fetchData = async () => {
  //       try {
  //         const clustersFromDatabase = await libGetClustersOnlineInfo(misServerUrl, scowApiAuthToken);
  //         const webOnlineClusters = formatOnlineClusters(clustersFromDatabase, configClusters, misDeployed);
  //         setCurrentClusters(webOnlineClusters);
  //       } catch (error) {
  //         console.error("Error fetching current clusters:", error);
  //       }
  //     };
  //     fetchData();
  //   }
  // }, []);

  return { currentClusters, setCurrentClusters };
}

