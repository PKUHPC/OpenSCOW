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

import { asyncUnaryCall } from "@ddadaal/tsgrpc-client";
import { Server } from "@ddadaal/tsgrpc-server";
import { credentials } from "@grpc/grpc-js";
import { ClusterConfigSchema, getClusterConfigs } from "@scow/config/build/cluster";
import { clusterConfigSchemaProto_K8sRuntimeToJSON, ConfigServiceClient } from "@scow/protos/build/common/config";
import { createServer } from "src/app";
import { logger } from "src/utils/logger";
import { getI18nTypeFormat, getLoginNodesTypeFormat } from "tests/file/utils";

let server: Server;
let client: ConfigServiceClient;

beforeEach(async () => {

  server = await createServer();

  await server.start();

  client = new ConfigServiceClient(server.serverAddress, credentials.createInsecure());
});

afterEach(async () => {
  await server.close();
});

it("get cluster configs info", async () => {

  const clusterConfigsByReadingFiles = getClusterConfigs(undefined, logger, ["hpc"]);

  const reply = await asyncUnaryCall(client, "getClusterConfigFiles", { query: {} });

  const clusterConfigsResp = reply.clusterConfigs;

  const modifiedClusters: Record<string, ClusterConfigSchema> = {};
  clusterConfigsResp.forEach((cluster) => {
    const { clusterId, ... rest } = cluster;
    const newCluster = {
      ...rest,
      displayName: getI18nTypeFormat(cluster.displayName),
      loginNodes: !cluster.loginNodes ? [] :
        getLoginNodesTypeFormat(cluster.loginNodes),
      k8s: cluster.k8s ? {
        k8sRuntime: clusterConfigSchemaProto_K8sRuntimeToJSON(cluster.k8s.runtime).toLowerCase(),
        kubeconfig: cluster.k8s.kubeconfig,
      } : undefined,
    };
    modifiedClusters[cluster.clusterId] = newCluster as ClusterConfigSchema;
  });

  expect(modifiedClusters).toEqual(clusterConfigsByReadingFiles);
});
