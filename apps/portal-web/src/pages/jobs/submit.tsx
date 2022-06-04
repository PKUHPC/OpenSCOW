import { Spin } from "antd";
import { NextPage } from "next";
import { useCallback } from "react";
import { useAsync } from "react-async";
import { api } from "src/apis";
import { requireAuth } from "src/auth/requireAuth";
import { PageTitle } from "src/components/PageTitle";
import { SubmitJobForm } from "src/pageComponents/job/SubmitJobForm";
import { CLUSTERS } from "src/utils/config";
import { Head } from "src/utils/head";
import { queryToString, useQuerystring } from "src/utils/querystring";

export const SubmitJobPage: NextPage = requireAuth(() => true)(
  () => {

    const query = useQuerystring();

    const cluster = queryToString(query.cluster);
    const savedJobId = queryToString(query.savedJobId);

    const { data, isLoading } = useAsync({
      promiseFn: useCallback(async () => {
        if (cluster && savedJobId) {
          const clusterObj = CLUSTERS.find((x) => x.id === cluster);
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
