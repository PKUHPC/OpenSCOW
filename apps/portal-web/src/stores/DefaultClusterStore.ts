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

import { useLocalStorage } from "@scow/lib-web/build/utils/hooks";
import { Cluster } from "src/utils/config";

const SCOW_DEFAULT_CLUSTER_ID = "SCOW_DEFAULT_CLUSTER_ID";

export function DefaultClusterStore(initialDefaultClusterId: string, currentClusters: Cluster[]) {

  const [clusterId, setClusterId] = useLocalStorage<String>(
    SCOW_DEFAULT_CLUSTER_ID,
    initialDefaultClusterId,
  );

  if (currentClusters.length === 0) {
    console.log("No available clusters");
  }

  const defaultCluster = currentClusters.find((cluster) => cluster.id === clusterId)
    || currentClusters[0] as Cluster;

  const setDefaultCluster = (cluster: Cluster) => {
    setClusterId(cluster.id);
  };

  const removeDefaultCluster = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(SCOW_DEFAULT_CLUSTER_ID);
    }
  };

  return { defaultCluster, setDefaultCluster, removeDefaultCluster };
}
