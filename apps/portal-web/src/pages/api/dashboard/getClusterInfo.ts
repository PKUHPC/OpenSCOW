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

import { typeboxRouteSchema } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncUnaryCall } from "@ddadaal/tsgrpc-client";
import { ConfigServiceClient, PartitionInfo_PartitionStatus } from "@scow/protos/build/portal/config";
import { Static, Type } from "@sinclair/typebox";
import { authenticate } from "src/auth/server";
import { getClient } from "src/utils/client";
import { route } from "src/utils/route";

export const PartitionInfo = Type.Object({
  partitionName: Type.String(),
  nodeCount: Type.Number(),
  runningNodeCount: Type.Number(),
  idleNodeCount: Type.Number(),
  notAvailableNodeCount: Type.Number(),
  cpuCoreCount: Type.Number(),
  runningCpuCount: Type.Number(),
  idleCpuCount: Type.Number(),
  notAvailableCpuCount: Type.Number(),
  gpuCoreCount: Type.Number(),
  runningGpuCount: Type.Number(),
  idleGpuCount: Type.Number(),
  notAvailableGpuCount: Type.Number(),
  jobCount: Type.Number(),
  runningJobCount: Type.Number(),
  pendingJobCount: Type.Number(),
  usageRatePercentage: Type.Number(),
  partitionStatus: Type.Enum(PartitionInfo_PartitionStatus),
});

export type PartitionInfo = Static<typeof PartitionInfo>;

export const ClusterInfo = Type.Object({
  clusterName: Type.String(),
  partitions: Type.Array(PartitionInfo),
});

export type ClusterInfo = Static<typeof ClusterInfo>;

export const GetClusterRunningInfoSchema = typeboxRouteSchema({
  method: "GET",

  query: Type.Object({
    clusterId: Type.String(),
  }),

  responses: {
    200: Type.Object({
      clusterInfo: ClusterInfo,
    }),

    403: Type.Null(),
  },
});

const auth = authenticate(() => true);

export default route(GetClusterRunningInfoSchema, async (req, res) => {

  const info = await auth(req, res);

  if (!info) { return; }

  const { clusterId } = req.query;

  const client = getClient(ConfigServiceClient);

  const reply = await asyncUnaryCall(client, "getClusterInfo", {
    cluster:clusterId,
  });

  return { 200: { clusterInfo: reply } };

});
