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

import { queryToString, useQuerystring } from "@scow/lib-web/build/utils/querystring";
import { Spin } from "antd";
import { NextPage } from "next";
import { useCallback } from "react";
import { useAsync } from "react-async";
import { api } from "src/apis";
import { requireAuth } from "src/auth/requireAuth";
import { PageTitle } from "src/components/PageTitle";
import { SubmitJobForm } from "src/pageComponents/job/SubmitJobForm";
import { publicConfig } from "src/utils/config";
import { Head } from "src/utils/head";

export const SubmitJobPage: NextPage = requireAuth(() => true)(
  () => {

    const query = useQuerystring();

    const cluster = queryToString(query.cluster);
    const savedJobId = queryToString(query.savedJobId);

    const { data, isLoading } = useAsync({
      promiseFn: useCallback(async () => {
        if (cluster && savedJobId) {
          const clusterObj = publicConfig.CLUSTERS.find((x) => x.id === cluster);
          if (!clusterObj) { return undefined; }
          return api.getSavedJob({ query: { cluster, id: savedJobId } })
            .then(({ jobInfo }) => ({
              cluster: clusterObj,
              command: jobInfo.command,
              jobName: jobInfo.jobName,
              partition: jobInfo.partition,
              nodeCount: jobInfo.nodeCount,
              coreCount: jobInfo.coreCount,
              qos: jobInfo.qos,
              maxTime: jobInfo.maxTime,
              account: jobInfo.account,
              comment: jobInfo.comment || "",
              workingDirectory: jobInfo.workingDirectory,
              save: false,
            }));
        } else {
          return undefined;
        }
      },
      [cluster, savedJobId]),
    });

    return (
      <div>
        <Head title="提交作业" />
        <PageTitle titleText={"提交作业"} />
        {
          isLoading ? (
            <Spin tip="正在加载作业模板" />
          ) : (
            <SubmitJobForm initial={data} />
          )
        }
      </div>
    );

  });

export default SubmitJobPage;
