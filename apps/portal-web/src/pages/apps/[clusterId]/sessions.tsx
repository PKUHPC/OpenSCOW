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

import { queryToString } from "@scow/lib-web/build/utils/querystring";
import { getI18nConfigCurrentText } from "@scow/lib-web/build/utils/systemLanguage";
import { Result } from "antd";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useStore } from "simstate";
import { requireAuth } from "src/auth/requireAuth";
import { PageTitle } from "src/components/PageTitle";
import { useI18n, useI18nTranslate, useI18nTranslateToString } from "src/i18n";
import { AppSessionsTable } from "src/pageComponents/app/AppSessionsTable";
import { ClusterInfoStore } from "src/stores/ClusterInfoStore";
import { Head } from "src/utils/head";

export const SessionsIndexPage: NextPage = requireAuth(() => true)(() => {

  const languageId = useI18n().currentLanguage.id;
  const router = useRouter();
  const clusterId = queryToString(router.query.clusterId);

  const { currentClusters } = useStore(ClusterInfoStore);
  const cluster = currentClusters.find((x) => x.id === clusterId);

  const tArgs = useI18nTranslate();
  const t = useI18nTranslateToString();

  if (!cluster) {
    return (
      <Result
        status="404"
        title={"404"}
        subTitle={t("pages.apps.sessions.subTitle")}
      />
    );
  }

  return (
    <div>
      <Head title={t("pages.apps.sessions.title")} />
      <PageTitle
        titleText={tArgs("pages.apps.sessions.pageTitle", [getI18nConfigCurrentText(cluster.name, languageId)])}
      />
      <AppSessionsTable cluster={cluster} />
    </div>
  );
});


export default SessionsIndexPage;
