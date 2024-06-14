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

import { PartitionInfo } from "@scow/protos/build/portal/config";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useCallback, useEffect } from "react";
import { useAsync } from "react-async";
import { useStore } from "simstate";
import { api } from "src/apis";
import { requireAuth } from "src/auth/requireAuth";
import { useI18nTranslateToString } from "src/i18n";
import { ClusterOverview, PlatformOverview } from "src/models/cluster";
import { OverviewTable } from "src/pageComponents/dashboard/OverviewTable";
import { QuickEntry } from "src/pageComponents/dashboard/QuickEntry";
import { ClusterInfoStore } from "src/stores/ClusterInfoStore";
import { UserStore } from "src/stores/UserStore";
import { Head } from "src/utils/head";
import { styled } from "styled-components";

interface Props {
}

interface FulfilledResult {
  clusterInfo: {clusterName: string, partitions: PartitionInfo[]}
}


export const DashboardPage: NextPage<Props> = requireAuth(() => true)(() => {

  const userStore = useStore(UserStore);
  const router = useRouter();

  useEffect(() => {
    router.replace(router.asPath);
  }, [userStore.user]);

  const t = useI18nTranslateToString();

  const { publicConfigClusters, currentClusters } = useStore(ClusterInfoStore);

  // const { data, isLoading } = useAsync({
  //   promiseFn: useCallback(async () => {

  //     const rawClusterInfoPromises = currentClusters.map((x) =>
  //       api.getClusterRunningInfo({ query: { clusterId: x.id } })
  //         .httpError(500, () => {}),
  //     );



  //     const rawClusterInfoResults = await Promise.allSettled(rawClusterInfoPromises);

  //     // 处理成功的结果
  //     const successfulResults = rawClusterInfoResults
  //     // 替换clusterId，适配器返回的clusterName和SCOW配置文件中的clusterId没关系
  //       .map((result, idx) => {
  //         if (result.status === "fulfilled") {
  //           return {
  //             ...result,
  //             value:{
  //               clusterInfo:{ clusterName: currentClusters[idx].id,
  //                 partitions:result.value.clusterInfo.partitions },
  //             },
  //           } as PromiseSettledResult<FulfilledResult>;
  //         }

  //         return result;
  //       })
  //       .filter(
  //         (result): result is PromiseFulfilledResult<FulfilledResult> =>
  //           result.status === "fulfilled")
  //       .map((result) => result.value);


  //     // 处理失败的结果
  //     const failedClusters = currentClusters.filter((x) =>
  //       !successfulResults.find((y) => y.clusterInfo.clusterName === x.id),
  //     );

  //     const clustersInfo = successfulResults
  //       .map((cluster) => ({ clusterInfo: { ...cluster.clusterInfo,
  //         clusterName: currentClusters.find((x) => x.id === cluster.clusterInfo.clusterName)?.name } }))
  //       .flatMap((cluster) =>
  //         cluster.clusterInfo.partitions.map((x) => ({
  //           clusterName: cluster.clusterInfo.clusterName,
  //           ...x,
  //           cpuUsage:((x.runningCpuCount / x.cpuCoreCount) * 100).toFixed(2),
  //           // 有些分区没有gpu就为空，前端显示'-'
  //           ...x.gpuCoreCount ? { gpuUsage:((x.runningGpuCount / x.gpuCoreCount) * 100).toFixed(2) } : {},
  //         })),
  //       );

  //     return {
  //       clustersInfo,
  //       failedClusters:failedClusters.map((x) => ({ clusterName:x.name })),
  //     };

  //   }, []),
  // });

  const { data, isLoading } = useAsync({
    promiseFn: useCallback(async () => {
      const rawClusterInfoPromises = currentClusters.map(async (x) => {
        try {
          const response = await fetch(`http://127.0.0.1:4523/m2/4389285-4033570-default/168305266?clusterId=${x.id}`);
          const result = await response.json();
          return {
            clusterInfo: {
              clusterName: x.id,
              partitions: result.clusterInfo.partitions,
            },
          };
        } catch (error) {
          console.error(error);
        }
      });

      const rawClusterInfoResults = await Promise.allSettled(rawClusterInfoPromises);

      // const successfulResults = rawClusterInfoResults
      //   .map((result, idx) => {
      //     if (result.status === "fulfilled") {
      //       return {
      //         ...result,
      //         value: {
      //           clusterInfo: {
      //             clusterName: currentClusters[idx].id,
      //             partitions: result?.value?.clusterInfo.partitions,
      //           },
      //         },
      //       } as PromiseSettledResult<FulfilledResult>;
      //     }

      //     return result;
      //   })
      //   .filter((result): result is PromiseFulfilledResult<FulfilledResult> => result.status === "fulfilled")
      //   .map((result) => result.value);

      const successfulResults = [
        {
          clusterInfo: {
            clusterName: "linux",
            partitions: [
              {
                partitionName: "各阶她节部",
                nodeCount: 3,
                runningNodeCount: 72,
                idleNodeCount: 67,
                notAvailableNodeCount: 78,
                cpuCoreCount: 61,
                runningCpuCount: 41,
                idleCpuCount: 65,
                notAvailableCpuCount: 78,
                gpuCoreCount: 6,
                runningGpuCount: 88,
                idleGpuCount: 71,
                notAvailableGpuCount: 97,
                jobCount: 96,
                runningJobCount: 96,
                pendingJobCount: 5,
                usageRatePercentage: 23,
                partitionStatus: 0,
              },
            ],
          },
        },
        {
          clusterInfo: {
            clusterName: "ubuntu",
            partitions: [
              {
                partitionName: "并值两集",
                nodeCount: 32,
                runningNodeCount: 40,
                idleNodeCount: 45,
                notAvailableNodeCount: 88,
                cpuCoreCount: 88,
                runningCpuCount: 83,
                idleCpuCount: 30,
                notAvailableCpuCount: 43,
                gpuCoreCount: 73,
                runningGpuCount: 36,
                idleGpuCount: 83,
                notAvailableGpuCount: 55,
                jobCount: 10,
                runningJobCount: 27,
                pendingJobCount: 96,
                usageRatePercentage: 84,
                partitionStatus: 0,
              },
            ],
          },
        },
        {
          clusterInfo: {
            clusterName: "debian",
            partitions: [
              {
                partitionName: "任问二难用",
                nodeCount: 80,
                runningNodeCount: 6,
                idleNodeCount: 14,
                notAvailableNodeCount: 11,
                cpuCoreCount: 14,
                runningCpuCount: 55,
                idleCpuCount: 41,
                notAvailableCpuCount: 86,
                gpuCoreCount: 22,
                runningGpuCount: 63,
                idleGpuCount: 73,
                notAvailableGpuCount: 65,
                jobCount: 90,
                runningJobCount: 94,
                pendingJobCount: 8,
                usageRatePercentage: 77,
                partitionStatus: 1,
              },
            ],
          },
        },
        {
          clusterInfo: {
            clusterName: "fedora",
            partitions: [
              {
                partitionName: "美委花",
                nodeCount: 82,
                runningNodeCount: 30,
                idleNodeCount: 44,
                notAvailableNodeCount: 79,
                cpuCoreCount: 83,
                runningCpuCount: 53,
                idleCpuCount: 89,
                notAvailableCpuCount: 19,
                gpuCoreCount: 65,
                runningGpuCount: 32,
                idleGpuCount: 46,
                notAvailableGpuCount: 25,
                jobCount: 6,
                runningJobCount: 43,
                pendingJobCount: 59,
                usageRatePercentage: 63,
                partitionStatus: 1,
              },
            ],
          },
        },
        {
          clusterInfo: {
            clusterName: "centos",
            partitions: [
              {
                partitionName: "个间采决物规",
                nodeCount: 55,
                runningNodeCount: 72,
                idleNodeCount: 54,
                notAvailableNodeCount: 29,
                cpuCoreCount: 47,
                runningCpuCount: 4,
                idleCpuCount: 4,
                notAvailableCpuCount: 64,
                gpuCoreCount: 5,
                runningGpuCount: 22,
                idleGpuCount: 96,
                notAvailableGpuCount: 74,
                jobCount: 35,
                runningJobCount: 40,
                pendingJobCount: 45,
                usageRatePercentage: 82,
                partitionStatus: 1,
              },
            ],
          },
        },
        {
          clusterInfo: {
            clusterName: "redhat",
            partitions: [
              {
                partitionName: "价许从二家记",
                nodeCount: 40,
                runningNodeCount: 33,
                idleNodeCount: 34,
                notAvailableNodeCount: 38,
                cpuCoreCount: 61,
                runningCpuCount: 69,
                idleCpuCount: 84,
                notAvailableCpuCount: 60,
                gpuCoreCount: 77,
                runningGpuCount: 50,
                idleGpuCount: 91,
                notAvailableGpuCount: 29,
                jobCount: 18,
                runningJobCount: 44,
                pendingJobCount: 95,
                usageRatePercentage: 19,
                partitionStatus: 1,
              },
            ],
          },
        },
        {
          clusterInfo: {
            clusterName: "arch",
            partitions: [
              {
                partitionName: "一电个员数",
                nodeCount: 22,
                runningNodeCount: 47,
                idleNodeCount: 53,
                notAvailableNodeCount: 56,
                cpuCoreCount: 42,
                runningCpuCount: 47,
                idleCpuCount: 7,
                notAvailableCpuCount: 26,
                gpuCoreCount: 31,
                runningGpuCount: 74,
                idleGpuCount: 5,
                notAvailableGpuCount: 1,
                jobCount: 36,
                runningJobCount: 64,
                pendingJobCount: 50,
                usageRatePercentage: 53,
                partitionStatus: 0,
              },
            ],
          },
        },
        {
          clusterInfo: {
            clusterName: "suse",
            partitions: [
              {
                partitionName: "产率音林",
                nodeCount: 6,
                runningNodeCount: 11,
                idleNodeCount: 55,
                notAvailableNodeCount: 81,
                cpuCoreCount: 24,
                runningCpuCount: 45,
                idleCpuCount: 79,
                notAvailableCpuCount: 92,
                gpuCoreCount: 88,
                runningGpuCount: 48,
                idleGpuCount: 26,
                notAvailableGpuCount: 53,
                jobCount: 83,
                runningJobCount: 54,
                pendingJobCount: 18,
                usageRatePercentage: 70,
                partitionStatus: 1,
              },
            ],
          },
        },
      ];

      const failedClusters = currentClusters.filter((x) =>
        !successfulResults.find((y) => y.clusterInfo.clusterName === x.id),
      );

      const clustersInfo = successfulResults
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
            gpuUsage: x.gpuCoreCount ? ((x.runningGpuCount / x.gpuCoreCount) * 100).toFixed(2) : undefined,
          })),
        );

      // 平台概览信息
      const platformOverview: PlatformOverview = {
        nodeCount:0,
        runningNodeCount:0,
        idleNodeCount:0,
        notAvailableNodeCount:0,
        cpuCoreCount:0,
        runningCpuCount:0,
        idleCpuCount:0,
        notAvailableCpuCount:0,
        gpuCoreCount:0,
        runningGpuCount:0,
        idleGpuCount:0,
        notAvailableGpuCount:0,
        jobCount:0,
        runningJobCount:0,
        pendingJobCount:0,
        usageRatePercentage:0,
        partitionStatus:0,
      };

      // 各个集群概览信息
      const clustersOverview: ClusterOverview[] = [];
      successfulResults.forEach((result) => {
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
            acc.usageRatePercentage += partition.usageRatePercentage;
            acc.partitionStatus += partition.partitionStatus;
            return acc;
          },
          {
            clusterName,
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
          },
        );

        // 累加平台概览信息
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
        platformOverview.usageRatePercentage += aggregatedData.usageRatePercentage;
        platformOverview.partitionStatus += aggregatedData.partitionStatus;

        clustersOverview.push(aggregatedData);
      });

      return {
        clustersInfo,
        failedClusters: failedClusters.map((x) => ({ clusterName: x.name })),
        clustersOverview,
        platformOverview,
      };
    }, [currentClusters]),
  });

  return (
    <DashboardPageContent>
      <Head title={t("pages.dashboard.title")} />
      <QuickEntry currentClusters={currentClusters} publicConfigClusters={publicConfigClusters} />
      <OverviewTable
        isLoading={isLoading}
        clusterInfo={data?.clustersInfo ? data.clustersInfo.map((item, idx) => ({ ...item, id:idx })) : []}
        failedClusters={data?.failedClusters ?? []}
        currentClusters={currentClusters}
        clustersOverview={data?.clustersOverview ?? []}
        platformOverview={data?.platformOverview }
      />
    </DashboardPageContent>
  );
});

const DashboardPageContent = styled.div`
`;

export default DashboardPage;
