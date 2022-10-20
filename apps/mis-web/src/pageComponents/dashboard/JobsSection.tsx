import Link from "next/link";
import React, { useCallback } from "react";
import { useAsync } from "react-async";
import { api } from "src/apis";
import { Section } from "src/components/Section";
import { RunningJobInfo } from "src/models/job";
import { RunningJobInfoTable } from "src/pageComponents/job/RunningJobTable";
import { User } from "src/stores/UserStore";
import { publicConfig } from "src/utils/config";

interface Props {
  user: User;
}

export const JobsSection: React.FC<Props> = ({ user }) => {

  const promiseFn = useCallback(() => {
    return Promise.all(Object.values(publicConfig.CLUSTERS).map(async ({ id, name }) => {
      return api.getRunningJobs({
        query: {
          cluster: id,
          userId: user.identityId,
        },
      })
        .then(({ results }) => results.map((x) => RunningJobInfo.fromGrpc(x, { id, name })))
        .catch(() => [] as RunningJobInfo[]);
    }, [])).then((x) => x.flat());
  }, [user.identityId]);

  const { data, isLoading, reload } = useAsync({ promiseFn });

  return (
    <Section
      title="未结束作业列表"
      extra={(
        <Link href="/user/runningJobs">
        查看所有未结束作业
        </Link>
      )}
    >
      <RunningJobInfoTable
        data={data}
        reload={reload}
        isLoading={isLoading}
        showAccount={true}
        showUser={false}
        showCluster={true}
      />
    </Section>
  );
};
