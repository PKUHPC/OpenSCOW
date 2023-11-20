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

  const data = [
    {
      clusterName:"集群1",
      partitionName:"分区1",
      nodes:20,
      runningNodes:4,
      idleNodes:10,
      noAvailableNodes:6,
      cpuCores:10,
      runningCpus:5,
      idleCpus:3,
      noAvailableCpus:2,
      gpuCores:12,
      runningGpus:5,
      idleGpus:3,
      noAvailableGpus:4,
      jobNum:100,
      runningJob:80,
      pendingJob:20,
      usageRate:"40%",
      status:"可用",
    },
    {
      clusterName:"集群2",
      partitionName:"分区1",
      nodes:7,
      runningNodes:5,
      idleNodes:1,
      noAvailableNodes:1,
      cpuCores:10,
      runningCpus:5,
      idleCpus:3,
      noAvailableCpus:2,
      gpuCores:14,
      runningGpus:7,
      idleGpus:3,
      noAvailableGpus:4,
      jobNum:100,
      runningJob:80,
      pendingJob:20,
      usageRate:"40%",
      status:"可用",
    },
    {
      clusterName:"集群3",
      partitionName:"分区1",
      nodes:19,
      runningNodes:15,
      idleNodes:2,
      noAvailableNodes:2,
      cpuCores:10,
      runningCpus:5,
      idleCpus:3,
      noAvailableCpus:2,
      gpuCores:12,
      runningGpus:5,
      idleGpus:3,
      noAvailableGpus:4,
      jobNum:120,
      runningJob:90,
      pendingJob:30,
      usageRate:"50%",
      status:"不可用",
    },
  ];
  const { data:clusterInfo, isLoading } = useAsync({
    promiseFn: useCallback(async () => {
      const clusters = publicConfig.CLUSTERS;

      const rawClusterInfo =
      await Promise.all(clusters.map((x) => api.getClusterRunningInfo({ query: { clusterId:x.id } })));

      return rawClusterInfo.flatMap((cluster) =>
        cluster.clusterInfo.partitions.map((x) => ({
          clusterName: cluster.clusterInfo.clusterName,
          ...x,
        })),
      );
    }, []),
  });

  return (
    <div>
      <Head title={t("pages.dashboard.title")} />
      <OverviewTable
        isLoading={isLoading}
        clusterInfo={clusterInfo ? clusterInfo.map((item, idx) => ({ ...item, id:idx })) : []}
      />
    </div>
  );
});

export default DashboardPage;
