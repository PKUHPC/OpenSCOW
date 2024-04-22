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

import { RefreshLink, useRefreshToken } from "@scow/lib-web/build/utils/refreshToken";
import { NextPage } from "next";
import { useCallback } from "react";
import { useAsync } from "react-async";
import { useStore } from "simstate";
import { api } from "src/apis";
import { requireAuth } from "src/auth/requireAuth";
import { PageTitle } from "src/components/PageTitle";
import { prefix, useI18n, useI18nTranslateToString } from "src/i18n";
import { ClusterConnectionStatus, ClusterOnlineStatus, Partition } from "src/models/cluster";
import { PlatformRole } from "src/models/User";
import { ClusterManagementTable } from "src/pageComponents/admin/ClusterManagementTable";
import { OnlineClustersStore } from "src/stores/OnlineClustersStore";
import { publicConfig } from "src/utils/config";
import { Head } from "src/utils/head";


export interface CombinedClusterInfo {
  clusterId: string,
  schedulerName: string,
  connectionStatus: ClusterConnectionStatus,
  partitions: Partition[],
  onlineStatus: ClusterOnlineStatus,
  comment?: string,
  operatorId?: string,
  operatorName?: string,
  updateTime: string,
}

export const ClusterManagementPage: NextPage =
  requireAuth((u) => u.platformRoles.includes(PlatformRole.PLATFORM_ADMIN))(() => {

    const t = useI18nTranslateToString();
    const languageId = useI18n().currentLanguage.id;
    const p = prefix("page.admin.systemDebug.clusterManagement.");

    const { setOnlineClusters } = useStore(OnlineClustersStore);

    const promiseFn = useCallback(async () => {
      const [connectionClustersData, onlineClustersData] = await Promise.all([
        api.getClustersConnectionInfo({}),
        api.getClustersOnlineInfo({}),
      ]);

      const onlineDataMap = onlineClustersData.results.reduce((acc, onlineData) => {
        if (acc[onlineData.clusterId]) {
          acc[onlineData.clusterId].push(onlineData);
        } else {
          acc[onlineData.clusterId] = [onlineData];
        }
        return acc;
      }, {});

      const connectionDataMap = connectionClustersData.results.reduce((acc, data) => {
        if (acc[data.clusterId]) {
          acc[data.clusterId].push(data);
        } else {
          acc[data.clusterId] = [data];
        }
        return acc;
      }, {});

      const combinedDataMap: Record<string, CombinedClusterInfo> = {};
      // 在线集群初始化
      setOnlineClusters({});
      Object.keys(onlineDataMap).forEach((key) => {
        const concatData = {
          ...onlineDataMap[key][0],
          ...connectionDataMap[key][0],
        } as CombinedClusterInfo;
        combinedDataMap[key] = concatData;
        if (concatData.onlineStatus === ClusterOnlineStatus.ONLINE) {
          setOnlineClusters((prev) => {
            return {
              ...prev,
              [key]: publicConfig.CLUSTERS[key],
            };
          });
        }

      });

      return combinedDataMap;
    }, []);

    const [refreshToken, update] = useRefreshToken();

    const { data, isLoading, reload } = useAsync({ promiseFn, watch: refreshToken });

    return (
      <div>
        <Head title={t(p("title"))} />
        <PageTitle titleText={t(p("title"))}>
          <RefreshLink refresh={update} languageId={languageId} />
        </PageTitle>
        <ClusterManagementTable
          data={data as Record<string, CombinedClusterInfo> | undefined}
          isLoading={isLoading}
          reload={reload}
        />
      </div>
    );

  });

export default ClusterManagementPage;
