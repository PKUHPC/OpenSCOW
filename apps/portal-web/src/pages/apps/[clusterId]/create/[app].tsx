/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * OpenSCOW is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import { LoadingOutlined } from "@ant-design/icons";
import { queryToString } from "@scow/lib-web/build/utils/querystring";
import { App } from "antd";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useCallback } from "react";
import { useAsync } from "react-async";
import { useStore } from "simstate";
import { api } from "src/apis";
import { requireAuth } from "src/auth/requireAuth";
import { ClusterNotAvailablePage } from "src/components/errorPages/ClusterNotAvailablePage";
import { PageTitle } from "src/components/PageTitle";
import { useI18nTranslateToString } from "src/i18n";
import { LaunchAppForm } from "src/pageComponents/app/LaunchAppForm";
import { ClusterInfoStore } from "src/stores/ClusterInfoStore";
import { Head } from "src/utils/head";


export const AppIndexPage: NextPage = requireAuth(() => true)(() => {

  const router = useRouter();
  const appId = queryToString(router.query.app);
  const clusterId = queryToString(router.query.clusterId);

  const { message } = App.useApp();
  const t = useI18nTranslateToString();

  const { currentClusters } = useStore(ClusterInfoStore);
  if (!currentClusters.find((x) => x.id === clusterId)) {
    return <ClusterNotAvailablePage />;
  }

  const { data, isLoading } = useAsync({
    promiseFn: useCallback(async () => {
      return await api.getAppMetadata({ query: { appId, cluster: clusterId } })
        .httpError(404, () => { message.error(t("pages.apps.create.error404")); });
    }, [appId]),
  });

  if (isLoading || !data) {
    return <LoadingOutlined />;
  }

  return (
    <div>
      <Head title={`${t("pages.apps.create.title")}${data.appName}`} />
      <PageTitle titleText={`${t("pages.apps.create.title")}${data.appName}`} />
      <LaunchAppForm
        appName={data.appName}
        attributes={data.appCustomFormAttributes}
        appId={appId}
        clusterId={clusterId}
        appComment={data.appComment}
      />
    </div>
  );
});

export default AppIndexPage;

