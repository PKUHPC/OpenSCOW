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
import { PageTitle } from "src/components/PageTitle";
import { trpc } from "src/utils/trpc";

import { LaunchAppForm } from "../LaunchAppForm";


export default function Page({ params }: {params: {clusterId: string}}) {

  const { clusterId } = params;

  const { message } = App.useApp();
  // const t = useI18nTranslateToString();

  const { data: clusterInfo, isLoading: isClusterLoading } = trpc.config.getClusterConfig.useQuery({ clusterId });


  if (isClusterLoading || !clusterInfo) {
    return <LoadingOutlined />;
  }

  return (
    <div>
      <PageTitle titleText="训练" />
      <LaunchAppForm
        clusterId={clusterId}
        clusterInfo={clusterInfo}
        isTraining={true}
      />
    </div>
  );
}


