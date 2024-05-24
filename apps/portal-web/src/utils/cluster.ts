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

import { ClusterConfigSchema } from "@scow/config/build/cluster";
import { I18nStringType } from "@scow/config/build/i18n";
import { getSortedClusters } from "@scow/lib-web/build/utils/cluster";
import { getI18nConfigCurrentText } from "@scow/lib-web/build/utils/systemLanguage";

import { runtimeConfig } from "./config";

/**
 * 当所有集群下都关闭桌面登录功能时，才关闭。
 * @param {Record<String, import("@scow/config/build/cluster").ClusterConfigSchema>} clusters
 * @param {import("@scow/config/build/portal").PortalConfigSchema} portalConfig
 * @returns {boolean} desktop login enable
 */
export function getDesktopEnabled(
  clusters: Record<string, ClusterConfigSchema>) {

  const clusterDesktopEnabled = Object.keys(clusters).reduce(
    ((pre, cur) => {
      const curClusterDesktopEnabled = clusters?.[cur]?.loginDesktop?.enabled !== undefined
        ? !!clusters[cur]?.loginDesktop?.enabled
        : runtimeConfig.PORTAL_CONFIG?.loginDesktop?.enabled;
        // : portalConfig.loginDesktop.enabled;

      return pre || curClusterDesktopEnabled;
    }), false,
  );

  return clusterDesktopEnabled;
}



export type Cluster = { id: string; name: I18nStringType; }

export const getLoginDesktopEnabled = (
  cluster: string, clusterConfigs: Record<string, ClusterConfigSchema>): boolean => {

  const clusterLoginDesktopEnabled = clusterConfigs[cluster]?.loginDesktop?.enabled;

  const commonLoginDesktopEnabled = runtimeConfig.PORTAL_CONFIG.loginDesktop.enabled;

  return clusterLoginDesktopEnabled === undefined ? commonLoginDesktopEnabled : clusterLoginDesktopEnabled;
};

export type LoginNode = { name: string, address: string }

export const getClusterName = (clusterId: string, languageId: string, publicConfigClusters: Cluster[]) => {

  return getI18nConfigCurrentText(publicConfigClusters.find((cluster) =>
    cluster.id === clusterId)?.name, languageId)
   || clusterId;
};

export const getPublicConfigClusters = (clusterConfigs: Record<string, ClusterConfigSchema>): Cluster[] => {
  return getSortedClusters(clusterConfigs).map((cluster) => ({ id: cluster.id, name: cluster.displayName }));
};

