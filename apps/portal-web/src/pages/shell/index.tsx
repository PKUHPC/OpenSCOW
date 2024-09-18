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

import { getI18nConfigCurrentText } from "@scow/lib-web/build/utils/systemLanguage";
import { Button } from "antd";
import { NextPage } from "next";
import { useStore } from "simstate";
import { requireAuth } from "src/auth/requireAuth";
import { Localized, useI18n, useI18nTranslateToString } from "src/i18n";
import { ClusterInfoStore } from "src/stores/ClusterInfoStore";
import { Head } from "src/utils/head";

export const ShellIndexPage: NextPage = requireAuth(() => true)(() => {

  const languageId = useI18n().currentLanguage.id;
  const t = useI18nTranslateToString();

  const { currentClusters } = useStore(ClusterInfoStore);

  return (
    <div>
      <Head title={t("pages.shell.index.title")} />
      <h1>
        <Localized id="pages.shell.index.content"></Localized>
      </h1>
      {currentClusters.map(({ id, name }) => (
        <a key={id} href={`/shell/${id}`} target="__blank">
          <Button>
            {getI18nConfigCurrentText(name, languageId)}
          </Button>
        </a>
      ))}
    </div>
  );
});

export default ShellIndexPage;
