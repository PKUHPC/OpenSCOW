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
import { useEffect, useState } from "react";
import { Cluster, publicConfig } from "src/utils/config";

const SCOW_DEFAULT_CLUSTER_ID = "SCOW_DEFAULT_CLUSTER_ID";
export const NOT_EXIST_CLUSTER: Cluster = { id: "", name: "" };

export function CurrentClustersStore(initialCurrentClusters: Cluster[]) {

  const [currentClusters, setCurrentClusters] = useState<Cluster[]>(!publicConfig.MIS_DEPLOYED
    ? publicConfig.CLUSTERS : initialCurrentClusters);

  const initialDefaultClusterId = publicConfig.CLUSTER_SORTED_ID_LIST.find((x) => {
    return currentClusters.find((c) => c.id === x);
  });

  const [clusterId, setClusterId] = useLocalStorage<String>(
    SCOW_DEFAULT_CLUSTER_ID,
    initialDefaultClusterId ?? "",
  );

  const defaultCluster = currentClusters.find((cluster) => cluster.id === clusterId)
  || (currentClusters[0] as Cluster ?? NOT_EXIST_CLUSTER);

  const setDefaultCluster = (cluster: Cluster) => {
    setClusterId(cluster.id);
  };

  const removeDefaultCluster = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(SCOW_DEFAULT_CLUSTER_ID);
    }
  };

  useEffect(() => {

    if (publicConfig.MIS_DEPLOYED) {
      // 可用集群不存在时
      if (currentClusters.length === 0) {

        // 保证页面正常渲染，后端报错处理，传递id为""的对象
        setDefaultCluster(NOT_EXIST_CLUSTER);
      } else {

        // 上一次记录的默认集群为NOT_EXIST_CLUSTER的情况
        if (!defaultCluster.id) {
          setDefaultCluster(currentClusters[0]);

          // 上一次记录的默认集群已不在可用集群中的情况
        } else {
          const currentDefaultExists = currentClusters.find((x) => x.id === defaultCluster?.id);
          if (!currentDefaultExists) {
            setDefaultCluster(currentClusters[0]);
          }
        }
      }
    }


  }, [currentClusters]);


  return {
    currentClusters,
    setCurrentClusters,
    defaultCluster,
    setDefaultCluster,
    removeDefaultCluster,
  };
}
