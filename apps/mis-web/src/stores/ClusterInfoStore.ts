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

import { ClusterConfigSchema, SimpleClusterSchema } from "@scow/config/build/cluster";
import { getSortedClusterIds } from "@scow/lib-web/build/utils/cluster";
import { useEffect, useState } from "react";
import { Cluster, getPublicConfigClusters } from "src/utils/cluster";

// export function ClusterInfoStore(
export function ClusterInfoStore(
  clusterConfigs: Record<string, ClusterConfigSchema>,
  initialActivatedClusters: Record<string, Cluster>,
  initialSimpleClusters: Record<string, SimpleClusterSchema>,
) {

  const publicConfigClusters = getPublicConfigClusters(clusterConfigs)
    ?? getPublicConfigClusters(initialSimpleClusters) ?? {};

  const clusterSortedIdList = getSortedClusterIds(clusterConfigs) ?? getSortedClusterIds(initialSimpleClusters) ?? [];

  const [activatedClusters, setActivatedClusters]
   = useState<Record<string, Cluster>>(initialActivatedClusters);

  const initialDefaultClusterId = clusterSortedIdList.find((x) => {
    return Object.keys(initialActivatedClusters).find((c) => c === x);
  });

  const initialDefaultCluster
   = initialDefaultClusterId ? activatedClusters[initialDefaultClusterId] : undefined;

  const [ defaultCluster, setDefaultCluster ] = useState<Cluster | undefined>(initialDefaultCluster);

  useEffect(() => {

    // 可用集群不存在时
    if (Object.keys(activatedClusters).length === 0) {
      setDefaultCluster(undefined);
    } else {

      // 上一次记录的默认集群为undefined的情况，使用可用集群中的某一个集群作为新的默认集群
      if (!defaultCluster?.id) {
        setDefaultCluster(Object.values(activatedClusters)[0]);

      // 上一次记录的默认集群已不在可用集群中的情况
      } else {
        const currentDefaultExists = Object.keys(activatedClusters).find((x) => x === defaultCluster?.id);
        if (!currentDefaultExists) {
          setDefaultCluster(Object.values(activatedClusters)[0]);
        }
      }
    }

  }, [activatedClusters]);

  return {
    publicConfigClusters,
    clusterSortedIdList,
    activatedClusters,
    setActivatedClusters,
    defaultCluster,
    setDefaultCluster,
  };
}
