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
import { PartitionInfo_PartitionStatus } from "@scow/protos/build/portal/config";
import { NodeInfo_NodeState } from "@scow/protos/build/portal/config";
import { TRPCError } from "@trpc/server";
import { router } from "src/server/trpc/def";
import { authProcedure } from "src/server/trpc/procedure/base";
import { getAdapterClient } from "src/server/utils/clusters";
import { z } from "zod";

// 定义分区信息
export const PartitionSchema = z.object({
  partitionName: z.string(),
  nodeCount: z.number(),
  runningNodeCount: z.number(),
  idleNodeCount: z.number(),
  notAvailableNodeCount: z.number(),
  cpuCoreCount: z.number(),
  runningCpuCount: z.number(),
  idleCpuCount: z.number(),
  notAvailableCpuCount: z.number(),
  gpuCoreCount: z.number(),
  runningGpuCount: z.number(),
  idleGpuCount: z.number(),
  notAvailableGpuCount: z.number(),
  jobCount: z.number(),
  runningJobCount: z.number(),
  pendingJobCount: z.number(),
  usageRatePercentage: z.number(),
  partitionStatus: z.nativeEnum(PartitionInfo_PartitionStatus),
});

// 定义集群信息
const ClusterInfoSchema = z.object({
  clusterName: z.string(),
  partitions: z.array(PartitionSchema), // 分区列表
});

export const NodeInfoSchema = z.object({
  nodeName: z.string(),
  partitions: z.array(z.string()),
  state: z.nativeEnum(NodeInfo_NodeState),
  cpuCoreCount: z.number(),
  allocCpuCoreCount: z.number(),
  idleCpuCoreCount: z.number(),
  totalMemMb: z.number(),
  allocMemMb: z.number(),
  idleMemMb: z.number(),
  gpuCount: z.number(),
  allocGpuCount: z.number(),
  idleGpuCount: z.number(),
});

// 更新集群节点信息的输出模式
const ClusterNodesInfoSchema = z.object({
  nodeInfo: z.array(NodeInfoSchema),
});

const ClusterNodesInfoInput = z.object({
  clusterId: z.string(),
  nodeNames: z.string().optional(), // 将 nodeNames 定义为逗号分隔的字符串
});


// tRPC 路由
export const dashboard = router({

  // 获取集群配置信息
  getClusterInfo: authProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/dashboard/cluster", // 定义 API 路径
        tags: ["dashboard"], // 标签分类
        summary: "clusterInfo", // 接口的简要说明
      },
    })
    // 输入为集群 ID
    .input(z.object({ clusterId: z.string() }))
    // 输出为集群配置
    .output(ClusterInfoSchema)
    .query(async ({ input }) => {
      const { clusterId } = input;

      const client = getAdapterClient(clusterId);
      if (!client) {
        // 如果找不到集群，抛出 404 错误
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Cluster ${clusterId} is not found`,
        });
      }

      const reply = await asyncClientCall(client.config, "getClusterInfo", {
        cluster: clusterId,
      });

      // 返回集群信息
      return {
        clusterName: reply.clusterName, // 集群名称
        partitions: reply.partitions, // 分区信息
      };
    }),

  getClusterNodesInfo: authProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/dashboard/nodes", // 定义 API 路径
        tags: ["dashboard"], // 标签分类
        summary: "clusterNodesInfo", // 接口的简要说明
      },
    })
    // 输入包含集群 ID 和可选节点名称
    .input(ClusterNodesInfoInput)
    .output(ClusterNodesInfoSchema)
    .query(async ({ input }) => {
      const { clusterId, nodeNames } = input;

      const client = getAdapterClient(clusterId);
      if (!client) {
        // 如果找不到集群，抛出 404 错误
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Cluster ${clusterId} is not found`,
        });
      }

      const nodeNamesArray = nodeNames ? nodeNames.split(",") : [];

      const reply = await asyncClientCall(client.config, "getClusterNodesInfo", {
        nodeNames: nodeNamesArray,
      });

      // 返回节点信息
      return {
        nodeInfo: reply.nodes, // 节点信息
      };
    }),
});
