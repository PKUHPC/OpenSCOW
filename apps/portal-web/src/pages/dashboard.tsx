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

import { message } from "antd";
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

  const { data:clusterInfo, isLoading } = useAsync({
    promiseFn: useCallback(async () => {
      const clusters = publicConfig.CLUSTERS;

      const { clustersInfo, failedClusters } =
      await api.getClustersRunningInfo({ query: { clusters:clusters.map((x) => x.id) } });

      if (failedClusters.length) {
        message.error(`以下集群信息获取失败:（${failedClusters.map((x) => clusters.find((y) => y.id === x)?.name).join("、")}）`);
      }
      return clustersInfo
        .flatMap((cluster) =>
          cluster.partitions.map((x) => ({
            clusterName: cluster.clusterName,
            ...x,
          })),
        );
    }, []),
  });

  return (
    <div>
      <Head title={t("pages.dashboard.title")} />
      <QuickEntry></QuickEntry>
      <OverviewTable
        isLoading={isLoading}
        clusterInfo={clusterInfo ? clusterInfo.map((item, idx) => ({ ...item, id:idx })) : []}
      />
    </div>
  );
});

export default DashboardPage;
