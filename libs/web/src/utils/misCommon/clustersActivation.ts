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

import { Cluster, ClusterActivationStatus, ClusterDatabaseInfo } from "@scow/config/build/type";

/**
 * format clusters used in web into activated clusters only
 * @param clustersFromDb clusters activation data from db, if mis is not deployed => []
 * @param  misConfigClusters config clusters type used in mis => {[clusterId: string]: Cluster},
 * @param configClusters config clusters type used in portal or other system => Cluster[]
 * @param misDeployed mis is deployed or not
 *
 * @returns misActivatedClusters
 * @returns activatedClusters
 */
export function formatActivatedClusters({
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
  misActivatedClusters?: {[clusterId: string]: Cluster},
  activatedClusters?: Cluster[],
} {

  // for system except mis, if mis is not deployed, using config clusters
  if (!misDeployed) {
    console.info("Mis is not deployed, using config clusters.");
    return { activatedClusters: configClusters };
  }

  if (!clustersFromDb || clustersFromDb.length === 0) {
    console.info("No available activated clusters in database.");
    return misConfigClusters ? { misActivatedClusters : {} } : { activatedClusters: []};
  }

  if (configClusters) {
    const activatedClusters = configClusters.filter((cluster) =>
      clustersFromDb.find((x) =>
        x.activationStatus === ClusterActivationStatus.ACTIVATED && x.clusterId === cluster.id),
    );
    return { activatedClusters: activatedClusters ?? []};


  } else {
    const misActivatedClusters: {[clusterId: string]: Cluster} = {};

    if (!misConfigClusters) {
      console.warn("No available clusters in Mis");
      return { misActivatedClusters: {} };
    } else {
      clustersFromDb.forEach((x) => {
        if (x.activationStatus === ClusterActivationStatus.ACTIVATED) {
          misActivatedClusters[x.clusterId] = misConfigClusters[x.clusterId];
        }
      });

      return { misActivatedClusters };
    }

  }

}

