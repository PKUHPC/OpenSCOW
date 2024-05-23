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

import { asyncClientCall } from "@ddadaal/tsgrpc-client";
import { ClusterConfigSchema } from "@scow/config/build/cluster";
import { getI18nTypeFormat, getLoginNodesTypeFormat } from "@scow/lib-web/src/utils/typeConversion";
import { ClusterConfigSchemaProto_LoginNodesProtoType, ConfigServiceClient } from "@scow/protos/build/common/config";
import { getClient } from "src/utils/client";

export async function getClusterConfigsInfo(): Promise<Record<string, ClusterConfigSchema>> {

  const client = getClient(ConfigServiceClient);
  const result = await asyncClientCall(client, "getClusterConfigsInfo", {});

  const modifiedClusters: Record<string, ClusterConfigSchema> = {};
  Object.keys(result.clusterConfigs).forEach((key) => {

    const cluster = result.clusterConfigs[key];
    const newCluster = {
      ...cluster,
      displayName: getI18nTypeFormat(cluster.displayName),
      loginNodes: getLoginNodesTypeFormat(
      cluster.loginNodes as ClusterConfigSchemaProto_LoginNodesProtoType | undefined),
    };
    modifiedClusters[key] = newCluster as ClusterConfigSchema;
  });

  return modifiedClusters;

}



