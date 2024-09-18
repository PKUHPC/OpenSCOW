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

import { Cluster } from "src/server/trpc/route/config";


const SCOW_DEFAULT_CLUSTER_ID = "SCOW_DEFAULT_CLUSTER_ID";

export function defaultClusterContext(clusters: Cluster[]) {

  const clusterId = window.localStorage.getItem(SCOW_DEFAULT_CLUSTER_ID);
  const defaultCluster = clusters.find((cluster) => cluster.id === clusterId) || clusters[0];

  const setDefaultCluster = (cluster: Cluster) => {
    window.localStorage.setItem(SCOW_DEFAULT_CLUSTER_ID, cluster.id);
  };

  const removeDefaultCluster = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(SCOW_DEFAULT_CLUSTER_ID);
    }
  };

  return { defaultCluster, setDefaultCluster, removeDefaultCluster };

}
