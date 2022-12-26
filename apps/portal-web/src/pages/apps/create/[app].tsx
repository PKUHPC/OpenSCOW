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

import { queryToString } from "@scow/lib-web/build/utils/querystring";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useStore } from "simstate";
import { requireAuth } from "src/auth/requireAuth";
import { NotFoundPage } from "src/components/errorPages/NotFoundPage";
import { PageTitle } from "src/components/PageTitle";
import { LaunchAppForm } from "src/pageComponents/app/LaunchAppForm";
import { AppsStore } from "src/stores/AppsStore";
import { Head } from "src/utils/head";


export const AppIndexPage: NextPage = requireAuth(() => true)(() => {

  const router = useRouter();
  const appId = queryToString(router.query.app);

  const apps = useStore(AppsStore);

  const app = apps.find((x) => x.id === appId);

  if (!app) {
    return (
      <NotFoundPage />
    );
  }

  return (
    <div>
      <Head title={`启动${app.name}`} />
      <PageTitle titleText={`启动${app.name}`} />
      <LaunchAppForm appId={appId} />
    </div>
  );
});

export default AppIndexPage;

