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

import { ClusterActivationStatus } from "@scow/config/build/type";
import { RefreshLink, useRefreshToken } from "@scow/lib-web/build/utils/refreshToken";
import { NextPage } from "next";
import { useCallback } from "react";
import { useAsync } from "react-async";
import { useStore } from "simstate";
import { api } from "src/apis";
import { requireAuth } from "src/auth/requireAuth";
import { PageTitle } from "src/components/PageTitle";
import { prefix, useI18n, useI18nTranslateToString } from "src/i18n";
import { ClusterConnectionStatus, Partition } from "src/models/cluster";
import { PlatformRole } from "src/models/User";
import { ClusterManagementTable } from "src/pageComponents/admin/ClusterManagementTable";
import { ActivatedClustersStore } from "src/stores/ActivatedClustersStore";
import { publicConfig } from "src/utils/config";
import { Head } from "src/utils/head";


export interface CombinedClusterInfo {
  clusterId: string,
  schedulerName: string,
  connectionStatus: ClusterConnectionStatus,
  partitions: Partition[],
  activationStatus: ClusterActivationStatus,
  deactivationComment?: string,
  operatorId?: string,
  operatorName?: string,
  updateTime: string,
}

export const ClusterManagementPage: NextPage =
  requireAuth((u) => u.platformRoles.includes(PlatformRole.PLATFORM_ADMIN))(() => {

    const t = useI18nTranslateToString();
    const languageId = useI18n().currentLanguage.id;
    const p = prefix("page.admin.resourceManagement.clusterManagement.");

    const { setActivatedClusters } = useStore(ActivatedClustersStore);

    const promiseFn = useCallback(async () => {
      const [connectionClustersData, activatedClustersData] = await Promise.all([
        api.getClustersConnectionInfo({}),
        api.getClustersDatabaseInfo({}),
      ]);

      const activatedDataMap = activatedClustersData.results.reduce((acc, activatedData) => {
        if (acc[activatedData.clusterId]) {
          acc[activatedData.clusterId].push(activatedData);
        } else {
          acc[activatedData.clusterId] = [activatedData];
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
      setActivatedClusters({});
      Object.keys(activatedDataMap).forEach((key) => {
        const concatData = {
          ...activatedDataMap[key][0],
          ...connectionDataMap[key][0],
        } as CombinedClusterInfo;
        combinedDataMap[key] = concatData;
        if (concatData.activationStatus === ClusterActivationStatus.ACTIVATED) {
          setActivatedClusters((prev) => {
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
