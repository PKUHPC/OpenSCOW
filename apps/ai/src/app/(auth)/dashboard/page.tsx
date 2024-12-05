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

"use client";
import { PartitionInfo } from "@scow/protos/build/portal/config";
import { useEffect, useState } from "react";
import { usePublicConfig } from "src/app/(auth)/context";
import { ClusterOverview, PlatformOverview } from "src/models/Cluster";
import { Head } from "src/utils/head";
import { trpc } from "src/utils/trpc";
import { styled } from "styled-components";

import { OverviewTable } from "./OverviewTable";

const DashboardPageContent = styled.div``;

interface ClusterPartitionInfo extends PartitionInfo {
  clusterName: string;
  cpuUsage: string;
  gpuUsage?: string;
}

const initialPlatformOverview: PlatformOverview = {
  nodeCount: 0,
  runningNodeCount: 0,
  idleNodeCount: 0,
  notAvailableNodeCount: 0,
  cpuCoreCount: 0,
  runningCpuCount: 0,
  idleCpuCount: 0,
  notAvailableCpuCount: 0,
  gpuCoreCount: 0,
  runningGpuCount: 0,
  idleGpuCount: 0,
  notAvailableGpuCount: 0,
  jobCount: 0,
  runningJobCount: 0,
  pendingJobCount: 0,
  usageRatePercentage: 0,
  partitionStatus: 0,
};

export default function Page() {
  const { publicConfig: { CLUSTERS: currentClusters } } = usePublicConfig();

  const clusterInfoResults = currentClusters.map((cluster) =>
    trpc.dashboard.getClusterInfo.useQuery({ clusterId: cluster.id }),
  );

  const clusterNodesResults = currentClusters.map((cluster) =>
    trpc.dashboard.getClusterNodesInfo.useQuery({ clusterId: cluster.id }),
  );

  // 加载失败的集群、成功的集群、集群信息、平台概览、以及集群概览。
  const [failedClusters, setFailedClusters] = useState<typeof currentClusters>([]);
  const [successfulClusters, setSuccessfulClusters] = useState<typeof currentClusters>([]);
  const [clustersInfo, setClustersInfo] = useState<ClusterPartitionInfo[]>([]);
  const [platformOverview, setPlatformOverview] = useState<PlatformOverview>({ ...initialPlatformOverview });
  const [clustersOverview, setClustersOverview] = useState<ClusterOverview[]>([]);

  const isLoading = clusterInfoResults.some((result) => result.isLoading) ||
  clusterNodesResults.some((result) => result.isLoading);

  useEffect(() => {
    if (!isLoading) {
      // 包含集群名和队列信息对象的集群数据列表
      const rawClusterInfoResults = clusterInfoResults
        .map((result, index) => {
          if (result.isSuccess) {
            return {
              clusterInfo: { ...result.data, clusterName: currentClusters[index].id },
              clusterName: currentClusters[index].id,// 保留所有索引
            };
          }
          return null;
        },
        ).filter((cluster) => cluster !== null);
      // 集群内的节点信息
      const rawClusterNodesInfoResults = clusterNodesResults
        .map((result, index) => {
          if (result.isSuccess) {
            return {
              nodeInfo: {
                clusterName: currentClusters[index].id, // clusterName变化提前了，hpc没有变化
                nodes: result.data?.nodeInfo || [],
              },
            };
          }
          return null;
        }).filter((node) => node !== null);

      const failedClusters = currentClusters.filter(
        (x) => !rawClusterInfoResults.find((y) => y.clusterInfo.clusterName === x.id),
      );

      const successfulClusters = currentClusters.filter((x) =>
        rawClusterInfoResults.find((y) => y.clusterInfo.clusterName === x.id),
      );

      setFailedClusters(failedClusters);
      setSuccessfulClusters(successfulClusters);

      // 初始化 nodeCountsByPartition 记录队列分区信息;
      const nodeCountsByPartition: Record<string, Record<string, number>> = {};

      // 统计分区节点信息;记录每个节点在各个队列的计数。
      rawClusterNodesInfoResults.forEach(({ nodeInfo }) => {
        // 各个集群的节点信息
        nodeInfo.nodes.forEach((node) => {
          // node代表每个节点
          node.partitions.forEach((partition) => {
            // 各个集群各个节点下的各个队列，无队列节点名则增加空对象，记录各个节点各个队列的出现数量
            if (!nodeCountsByPartition[node.nodeName]) {
              nodeCountsByPartition[node.nodeName] = {};
            }
            if (!nodeCountsByPartition[node.nodeName][partition]) {
              nodeCountsByPartition[node.nodeName][partition] = 0;
            }
            nodeCountsByPartition[node.nodeName][partition]++;
          });
        });
      });

      // 存储各集群各队列分区的详细信息
      const clustersInfo = rawClusterInfoResults
        .map((cluster) => ({
          clusterInfo: {
            ...cluster.clusterInfo,
            clusterName: cluster.clusterInfo.clusterName,
          },
        }))
        .flatMap((cluster) =>
          cluster.clusterInfo.partitions.map((x) => ({
            clusterName: cluster.clusterInfo.clusterName,
            ...x,
            cpuUsage: ((x.runningCpuCount / x.cpuCoreCount) * 100).toFixed(2),
            gpuUsage: x.gpuCoreCount
              ? ((x.runningGpuCount / x.gpuCoreCount) * 100).toFixed(2)
              : undefined,
          })),
        );

      // 整合各集群的各分区信息，计算集群概览的聚合数据,
      const clustersOverview: ClusterOverview[] = [];
      rawClusterInfoResults.forEach((result) => {
        // 各集群
        const { clusterName, partitions } = result.clusterInfo;
        const aggregatedData = partitions.reduce(
          (acc, partition) => {
            acc.nodeCount += partition.nodeCount;
            acc.runningNodeCount += partition.runningNodeCount;
            acc.idleNodeCount += partition.idleNodeCount;
            acc.notAvailableNodeCount += partition.notAvailableNodeCount;
            acc.cpuCoreCount += partition.cpuCoreCount;
            acc.runningCpuCount += partition.runningCpuCount;
            acc.idleCpuCount += partition.idleCpuCount;
            acc.notAvailableCpuCount += partition.notAvailableCpuCount;
            acc.gpuCoreCount += partition.gpuCoreCount;
            acc.runningGpuCount += partition.runningGpuCount;
            acc.idleGpuCount += partition.idleGpuCount;
            acc.notAvailableGpuCount += partition.notAvailableGpuCount;
            acc.jobCount += partition.jobCount;
            acc.runningJobCount += partition.runningJobCount;
            acc.pendingJobCount += partition.pendingJobCount;
            return acc;
          },
          {
            clusterName,
            ...initialPlatformOverview,
          },
        );


        // 处理节点实际数据，调整聚合数据 真实节点数据列表
        const realNode = rawClusterNodesInfoResults.
          find((v) => v.nodeInfo.clusterName === clusterName)?.nodeInfo.nodes;

        // 修正聚合数据中的节点计数和 CPU/GPU 数据
        if (realNode) {
          aggregatedData.runningNodeCount = realNode.filter((v) => v.state === 2).length; // 正在运行
          aggregatedData.notAvailableNodeCount = realNode.filter((v) => v.state === 3).length; // 不可用
          aggregatedData.idleNodeCount = realNode.filter((v) => v.state === 1).length; // 空闲节点
          // 重置CPU GPU的计数
          aggregatedData.cpuCoreCount = 0;
          aggregatedData.runningCpuCount = 0;
          aggregatedData.idleCpuCount = 0;
          aggregatedData.gpuCoreCount = 0;
          aggregatedData.runningGpuCount = 0;
          aggregatedData.idleGpuCount = 0;
          // 重新计算CPU GPU的计数
          for (const node of realNode) {
            aggregatedData.cpuCoreCount += node.cpuCoreCount;
            aggregatedData.idleCpuCount += node.idleCpuCoreCount;
            aggregatedData.runningCpuCount += node.allocCpuCoreCount;
            aggregatedData.gpuCoreCount += node.gpuCount;
            aggregatedData.idleGpuCount += node.idleGpuCount;
            aggregatedData.runningGpuCount += node.allocGpuCount;
          }
        }

        // 更新平台概览 platformOverview 的数值
        platformOverview.nodeCount += aggregatedData.nodeCount;
        platformOverview.runningNodeCount += aggregatedData.runningNodeCount;
        platformOverview.idleNodeCount += aggregatedData.idleNodeCount;
        platformOverview.notAvailableNodeCount += aggregatedData.notAvailableNodeCount;
        platformOverview.cpuCoreCount += aggregatedData.cpuCoreCount;
        platformOverview.runningCpuCount += aggregatedData.runningCpuCount;
        platformOverview.idleCpuCount += aggregatedData.idleCpuCount;
        platformOverview.notAvailableCpuCount += aggregatedData.notAvailableCpuCount;
        platformOverview.gpuCoreCount += aggregatedData.gpuCoreCount;
        platformOverview.runningGpuCount += aggregatedData.runningGpuCount;
        platformOverview.idleGpuCount += aggregatedData.idleGpuCount;
        platformOverview.notAvailableGpuCount += aggregatedData.notAvailableGpuCount;
        platformOverview.jobCount += aggregatedData.jobCount;
        platformOverview.runningJobCount += aggregatedData.runningJobCount;
        platformOverview.pendingJobCount += aggregatedData.pendingJobCount;
        platformOverview.partitionStatus += aggregatedData.partitionStatus;

        aggregatedData.usageRatePercentage = Number(
          ((aggregatedData.runningNodeCount / aggregatedData.nodeCount) * 100).toFixed(2),
        );

        clustersOverview.push(aggregatedData);
      });

      platformOverview.usageRatePercentage = Number(
        ((platformOverview.runningNodeCount / platformOverview.nodeCount) * 100).toFixed(2),
      );

      setFailedClusters(failedClusters);
      setSuccessfulClusters(successfulClusters);
      setClustersInfo(clustersInfo);
      setPlatformOverview(platformOverview);
      setClustersOverview(clustersOverview);

    }

  }, [isLoading,currentClusters]);

  return (
    <DashboardPageContent>
      <Head title={"dashboard"} />
      <OverviewTable
        isLoading={isLoading}
        clusterInfo={clustersInfo ? clustersInfo.map((item, idx) => ({ ...item, id: idx })) : []}
        failedClusters={failedClusters ? failedClusters.map((x) => ({ clusterName: x.name })) : []}
        currentClusters={currentClusters}
        clustersOverview={clustersOverview ?? []}
        platformOverview={platformOverview}
        successfulClusters={successfulClusters}
      />
    </DashboardPageContent>
  );
}
