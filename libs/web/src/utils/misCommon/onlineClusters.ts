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

import { Cluster, ClusterDatabaseInfo, ClusterOnlineStatus } from "@scow/config/build/type";

/**
 * format clusters used in web into online clusters only
 * @param clustersFromDb clusters online data from db, if mis is not deployed => []
 * @param  misConfigClusters config clusters type used in mis
 * @param configClusters config clusters type used in portal or other system
 * @param misDeployed mis is deployed or not
 *
 * @returns misOnlineClusters
 * @returns onlineClusters
 */
export function formatOnlineClusters({
  clustersFromDb,
  misConfigClusters,
  configClusters,
  misDeployed = true,
}: {
  clustersFromDb?: ClusterDatabaseInfo[],
  misConfigClusters?: {[clusterId: string]: Cluster},
  configClusters?: Cluster[],
  misDeployed?: boolean,
}): {
  misOnlineClusters?: {[clusterId: string]: Cluster},
  onlineClusters?: Cluster[],
} {

  // for system except mis, if mis is not deployed, using config clusters
  if (!misDeployed) {
    console.info("Mis is not deployed, using config clusters.");
    return { onlineClusters: configClusters };
  }

  if (!clustersFromDb || clustersFromDb.length === 0) {
    console.info("No available online clusters in database.");
    return misConfigClusters ? { misOnlineClusters : {} } : { onlineClusters: []};
  }

  if (configClusters) {
    const onlineClusters = configClusters.filter((cluster) =>
      clustersFromDb.find((x) => x.onlineStatus === ClusterOnlineStatus.ONLINE && x.clusterId === cluster.id),
    );
    return { onlineClusters: onlineClusters ?? []};


  } else {
    const misOnlineClusters: {[clusterId: string]: Cluster} = {};

    if (!misConfigClusters) {
      console.warn("No available clusters in Mis");
      return { misOnlineClusters: {} };
    } else {
      clustersFromDb.forEach((x) => {
        if (x.onlineStatus === ClusterOnlineStatus.ONLINE) {
          misOnlineClusters[x.clusterId] = misConfigClusters[x.clusterId];
        }
      });

      return { misOnlineClusters };
    }

  }

}

