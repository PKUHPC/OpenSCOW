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

"use client";

import { LoadingOutlined } from "@ant-design/icons";
import { App } from "antd";
import { PageTitle } from "src/components/pageTitle";
import { trpc } from "src/utils/trpc";

import { LaunchAppForm } from "../../LaunchAppForm";



export default function Page({ params }: {params: {clusterId: string, appId: string}}) {

  const { appId, clusterId } = params;

  const { message } = App.useApp();
  // const t = useI18nTranslateToString();

  const { data: appInfo, isLoading: isAppLoading } = trpc.jobs.getAppMetadata.useQuery({ clusterId, appId });

  const { data: clusterInfo, isLoading: isClusterLoading } = trpc.config.getClusterConfig.useQuery({ clusterId });


  if (isAppLoading || isClusterLoading || !appInfo || !clusterInfo) {
    return <LoadingOutlined />;
  }

  return (
    <div>
      <PageTitle titleText={`${appInfo.appName}训练`} />
      <LaunchAppForm
        appName={appInfo.appName}
        attributes={appInfo.attributes}
        appId={appId}
        clusterId={clusterId}
        appComment={appInfo.appComment}
        clusterInfo={clusterInfo}
        isTraining={true}
      />
    </div>
  );
}


