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

import { formatOnlineClusters } from "@scow/lib-web/build/utils/misCommon/onlineClusters";
import { ClusterOnlineInfo } from "@scow/protos/build/server/config";
import { useEffect, useState } from "react";
import { api } from "src/apis";
import { Cluster, publicConfig } from "src/utils/config";


export function OnlineClustersStore(initialOnlineClusters: {[clusterId: string]: Cluster;}) {
  const [onlineClusters, setOnlineClusters]
   = useState<{[clusterId: string]: Cluster;}>(initialOnlineClusters);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const clustersFromDatabase
         = await api.getClustersOnlineInfo({}).then((x) => x, () => undefined);
        const webOnlineClusters
         = formatOnlineClusters(clustersFromDatabase?.results as ClusterOnlineInfo[], publicConfig.CLUSTERS);

        setOnlineClusters(webOnlineClusters as {[clusterId: string]: Cluster;});
      } catch (error) {
        console.error("Error fetching current clusters:", error);
      }
    };
    fetchData();
  }, []);

  return { onlineClusters, setOnlineClusters };
}
