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

"use client";

import { LoadingOutlined } from "@ant-design/icons";
import { useSearchParams } from "next/navigation";
import { PageTitle } from "src/components/PageTitle";
import { ServerErrorPage } from "src/layouts/error/ServerErrorPage";
import { trpc } from "src/utils/trpc";

import { LaunchAppForm } from "../LaunchAppForm";

export default function Page({ params }: { params: { clusterId: string } }) {

  const { clusterId } = params;

  const searchParams = useSearchParams();

  const jobId = searchParams?.get("jobId");
  const jobName = searchParams?.get("jobName");


  const { data: clusterInfo, isLoading: isClusterLoading, isError } =
  trpc.config.getClusterConfig.useQuery({ clusterId });


  const parsedJobId = jobId ? parseInt(jobId, 10) : null;

  const { data: submitTrainParams, isLoading: isSubmitTrainParamsLoading } = trpc.jobs.getSubmitTrainParams.useQuery(
    { clusterId, jobId: parsedJobId!, jobName: jobName! }, {
      enabled: (!!jobId && !!jobName),
      retry: false,
    });


  if (
    isClusterLoading
    || !clusterInfo
    || (!!jobId && !!jobName && (isSubmitTrainParamsLoading))) {

    return <LoadingOutlined />;
  }

  if (isError) {
    return (
      <ServerErrorPage />
    );
  }

  return (
    <div>
      <PageTitle titleText="训练" />
      <LaunchAppForm
        clusterId={clusterId}
        clusterInfo={clusterInfo}
        isTraining={true}
        trainJobInput={submitTrainParams}
      />
    </div>
  );
}


