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
import { requireAuth } from "src/auth/requireAuth";
import { PageTitle } from "src/components/PageTitle";
import { AppSessionsTable } from "src/pageComponents/app/AppSessionsTable";
import { publicConfig } from "src/utils/config";
import { Head } from "src/utils/head";

export const SessionsIndexPage: NextPage = requireAuth(() => true)(() => {

  const router = useRouter();
  const cluster = queryToString(router.query.clusterId);

  const clusterName = publicConfig.CLUSTERS.find((x) => x.id === cluster)?.name || cluster;

  return (
    <div>
      <Head title="交互式应用" />
      {/* 页面名称加集群？ */}
      <PageTitle titleText={`集群${clusterName}交互式应用`} />
      <AppSessionsTable />
    </div>
  );
});


export default SessionsIndexPage;
