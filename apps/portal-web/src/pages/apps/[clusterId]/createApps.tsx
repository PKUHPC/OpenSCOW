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
import { Result } from "antd";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { requireAuth } from "src/auth/requireAuth";
import { PageTitle } from "src/components/PageTitle";
import { CreateAppsTable } from "src/pageComponents/app/CreateAppsTable";
import { publicConfig } from "src/utils/config";
import { Head } from "src/utils/head";

export const CreatAppsIndexPage: NextPage = requireAuth(() => true)(() => {

  const router = useRouter();
  const clusterId = queryToString(router.query.clusterId);
  const cluster = publicConfig.CLUSTERS.find((x) => x.id === clusterId);

  if (!cluster) {
    return (
      <Result
        status="404"
        title={"404"}
        subTitle={"您所请求的集群不存在。"}
      />
    );
  }

  return (
    <div>
      <Head title="创建应用" />
      <PageTitle titleText={`集群${cluster.name}可创建的应用`} />
      <CreateAppsTable clusterId={clusterId} />
    </div>
  );
});

export default CreatAppsIndexPage;
