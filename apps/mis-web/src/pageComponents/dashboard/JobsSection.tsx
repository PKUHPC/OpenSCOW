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

import Link from "next/link";
import { useTranslation } from "next-i18next";
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

  const { t } = useTranslation("translations", { keyPrefix: "dashboard.job" });

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
      // title="未结束作业列表"
      title={t("title")}
      extra={(
        <Link href="/user/runningJobs">
          {/* 查看所有未结束作业 */}
          {t("extra")}
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
