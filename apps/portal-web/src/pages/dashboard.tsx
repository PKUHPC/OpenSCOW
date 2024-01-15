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

interface Props {
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

      const { clustersInfo, failedClusters } =
      await api.getClustersRunningInfo({ query: { clusters:clusters.map((x) => x.id) } });

      return {
        clustersInfo:clustersInfo
          .flatMap((cluster) =>
            cluster.partitions.map((x) => ({
              clusterName:  clusters.find((y) => y.id === cluster.clusterName)?.name,
              ...x,
              cpuUsage:x.runningCpuCount / x.cpuCoreCount,
              ...x.gpuCoreCount ? { gpuUsage:x.runningGpuCount / x.gpuCoreCount } : {},
            })),
          ),
        failedClusters:failedClusters.map((x) => ({ clusterName:clusters.find((y) => y.id === x)?.name })),
      };
    }, []),
  });

  return (
    <div>
      <Head title={t("pages.dashboard.title")} />
      <QuickEntry></QuickEntry>
      <OverviewTable
        isLoading={isLoading}
        clusterInfo={data?.clustersInfo ? data.clustersInfo.map((item, idx) => ({ ...item, id:idx })) : []}
        failedClusters={data?.failedClusters ?? []}
      />
    </div>
  );
});

export default DashboardPage;
