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

import { authenticate } from "src/auth/server";
import { Cluster, publicConfig, runtimeConfig } from "src/utils/config";
import { route } from "src/utils/route";

export interface ListAvailableTransferClustersSchema {
  method: "GET";

  query: {}

  responses: {
    200: {
      clusterList: Cluster[];
    }

    403: null;
  }
}

const auth = authenticate(() => true);

export default route<ListAvailableTransferClustersSchema>("ListAvailableTransferClustersSchema", async (req, res) => {

  const info = await auth(req, res);

  if (!info) { return; }

  const clusterList: Cluster[] = publicConfig.CLUSTERS.filter(
    (x) => runtimeConfig.CLUSTERS_CONFIG[x.id].crossClusterFilesTransfer.enabled);


  return { 200: { clusterList: clusterList } };

});
