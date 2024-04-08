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
import { OverviewTable } from "src/pageComponents/dashboard/OverviewTable";
import { QuickEntry } from "src/pageComponents/dashboard/QuickEntry";
import { UserStore } from "src/stores/UserStore";
import { publicConfig } from "src/utils/config";
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

  const { data, isLoading } = useAsync({
    promiseFn: useCallback(async () => {

      const clusters = publicConfig.CLUSTERS;

      const rawClusterInfoPromises = clusters.map((x) =>
        api.getClusterRunningInfo({ query: { clusterId: x.id } })
          .httpError(500, () => {}),
      );

      const rawClusterInfoResults = await Promise.allSettled(rawClusterInfoPromises);

      // 处理成功的结果
      const successfulResults = rawClusterInfoResults
      // 替换clusterId，适配器返回的clusterName和SCOW配置文件中的clusterId没关系
        .map((result, idx) => {
          if (result.status === "fulfilled") {
            return {
              ...result,
              value:{
                clusterInfo:{ clusterName:clusters[idx].id,
                  partitions:result.value.clusterInfo.partitions },
              },
            } as PromiseSettledResult<FulfilledResult>;
          }

          return result;
        })
        .filter(
          (result): result is PromiseFulfilledResult<FulfilledResult> =>
            result.status === "fulfilled")
        .map((result) => result.value);


      // 处理失败的结果
      const failedClusters = clusters.filter((x) =>
        !successfulResults.find((y) => y.clusterInfo.clusterName === x.id),
      );

      const clustersInfo = successfulResults
        .map((cluster) => ({ clusterInfo: { ...cluster.clusterInfo,
          clusterName: clusters.find((x) => x.id === cluster.clusterInfo.clusterName)?.name } }))
        .flatMap((cluster) =>
          cluster.clusterInfo.partitions.map((x) => ({
            clusterName: cluster.clusterInfo.clusterName,
            ...x,
            cpuUsage:((x.runningCpuCount / x.cpuCoreCount) * 100).toFixed(2),
            // 有些分区没有gpu就为空，前端显示'-'
            ...x.gpuCoreCount ? { gpuUsage:((x.runningGpuCount / x.gpuCoreCount) * 100).toFixed(2) } : {},
          })),
        );

      return {
        clustersInfo,
        failedClusters:failedClusters.map((x) => ({ clusterName:x.name })),
      };

    }, []),
  });

  return (
    <DashboardPageContent>
      <Head title={t("pages.dashboard.title")} />
      <QuickEntry />
      <OverviewTable
        isLoading={isLoading}
        clusterInfo={data?.clustersInfo ? data.clustersInfo.map((item, idx) => ({ ...item, id:idx })) : []}
        failedClusters={data?.failedClusters ?? []}
      />
    </DashboardPageContent>
  );
});

const DashboardPageContent = styled.div`
`;

export default DashboardPage;
