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

import { LoadingOutlined } from "@ant-design/icons";
import { queryToString } from "@scow/lib-web/build/utils/querystring";
import { App } from "antd";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useCallback } from "react";
import { useAsync } from "react-async";
import { api } from "src/apis";
import { requireAuth } from "src/auth/requireAuth";
import { PageTitle } from "src/components/PageTitle";
import { LaunchAppForm } from "src/pageComponents/app/LaunchAppForm";
import { Head } from "src/utils/head";


export const AppIndexPage: NextPage = requireAuth(() => true)(() => {

  const router = useRouter();
  const appId = queryToString(router.query.app);
  const clusterId = queryToString(router.query.clusterId);

  const { message } = App.useApp();

  const { data, isLoading } = useAsync({
    promiseFn: useCallback(async () => {
      return await api.getAppMetadata({ query: { appId, cluster: clusterId } })
        .httpError(404, () => { message.error("此应用不存在"); })
        .then((res) => res);
    }, [appId]),
  });

  if (isLoading || !data) {
    return <LoadingOutlined />;
  }

  return (
    <div>
      <Head title={`创建${data.appName}`} />
      <PageTitle titleText={`创建${data.appName}`} />
      <LaunchAppForm
        appName={data.appName}
        attributes={data.appCustomFormAttributes}
        appId={appId}
        clusterId={clusterId}
      />
    </div>
  );
});

export default AppIndexPage;

