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

import { getSortedClusterIds } from "@scow/config/build/cluster";
import { ClusterActivationStatus } from "@scow/config/build/type";
import { getCurrentLanguageId, getI18nConfigCurrentText } from "@scow/lib-web/build/utils/systemLanguage";
import { GetServerSideProps, NextPage } from "next";
import { useStore } from "simstate";
import { api } from "src/apis";
import { requireAuth } from "src/auth/requireAuth";
import { NotFoundPage } from "src/components/errorPages/NotFoundPage";
import { PageTitle } from "src/components/PageTitle";
import { useI18nTranslateToString } from "src/i18n";
import { DesktopTable } from "src/pageComponents/desktop/DesktopTable";
import { ClusterInfoStore } from "src/stores/ClusterInfoStore";
import { Cluster, getLoginDesktopEnabled } from "src/utils/cluster";
import { publicConfig } from "src/utils/config";
import { Head } from "src/utils/head";
type Props = {
  loginDesktopEnabledClusters: Cluster[];
};

export const DesktopIndexPage: NextPage<Props> = requireAuth(() => true)
((props: Props) => {

  const { enableLoginDesktop } = useStore(ClusterInfoStore);
  if (!enableLoginDesktop || props.loginDesktopEnabledClusters.length === 0) {
    return <NotFoundPage />;
  }

  const t = useI18nTranslateToString();

  return (
    <div>
      <Head title={t("pages.desktop.title")} />
      <PageTitle titleText={t("pages.desktop.pageTitle")} />
      <DesktopTable loginDesktopEnabledClusters={props.loginDesktopEnabledClusters} />
    </div>
  );
});


export const getServerSideProps: GetServerSideProps<Props> = async ({ req }) => {

  const languageId = getCurrentLanguageId(req, publicConfig.SYSTEM_LANGUAGE_CONFIG);

  const resp = await api.getClusterConfigFiles({ query: {} });
  const clusterConfigs = resp.clusterConfigs;
  const clusterSortedIdList = getSortedClusterIds(resp.clusterConfigs);

  const currentClusters = await api.getClustersRuntimeInfo({ query: {} }).then((x) => x, () => undefined);

  const activatedClusterIds = currentClusters?.results
    .filter((x) => x.activationStatus === ClusterActivationStatus.ACTIVATED).map((x) => x.clusterId) ?? [];
  const sortedCurrentClusterIds = clusterSortedIdList.filter((id) => activatedClusterIds.includes(id));

  const sortedClusterIdList = publicConfig.MIS_DEPLOYED ?
    sortedCurrentClusterIds : clusterSortedIdList;

  const loginDesktopEnabledClusters = sortedClusterIdList
    .filter((clusterId) => getLoginDesktopEnabled(clusterId, clusterConfigs))
    .map((clusterId) => ({
      id: clusterId,
      name: getI18nConfigCurrentText(clusterConfigs[clusterId].displayName, languageId) } as Cluster));

  return {
    props: {
      loginDesktopEnabledClusters,
    },
  };
};

export default DesktopIndexPage;
