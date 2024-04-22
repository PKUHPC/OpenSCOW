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

import { queryToArray, queryToString } from "@scow/lib-web/build/utils/querystring";
import { getI18nConfigCurrentText } from "@scow/lib-web/build/utils/systemLanguage";
import { Result } from "antd";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useStore } from "simstate";
import { requireAuth } from "src/auth/requireAuth";
import { useI18n, useI18nTranslateToString } from "src/i18n";
import { FileManager } from "src/pageComponents/filemanager/FileManager";
import { CurrentClustersStore } from "src/stores/CurrentClustersStore";
import { Head } from "src/utils/head";

export const FileManagerPage: NextPage = requireAuth(() => true)(() => {

  const languageId = useI18n().currentLanguage.id;

  const router = useRouter();
  const pathParts = queryToArray(router.query.path);

  const cluster = queryToString(router.query.cluster);

  const t = useI18nTranslateToString();

  const { currentClusters } = useStore(CurrentClustersStore);
  const clusterObj = currentClusters.find((x) => x.id === cluster);

  const fullPath = "/" + pathParts?.join("/") ?? "";

  if (!clusterObj) {
    return (
      <Result
        status="404"
        title={"404"}
        subTitle={t("pages.files.path.title")}
      />
    );
  }


  return (
    <>
      <Head title={`${getI18nConfigCurrentText(clusterObj.name, languageId)}${t("pages.files.path.title")}`} />
      <FileManager
        cluster={clusterObj}
        path={fullPath}
        urlPrefix="/files"
      />
    </>
  );
});

export default FileManagerPage;
