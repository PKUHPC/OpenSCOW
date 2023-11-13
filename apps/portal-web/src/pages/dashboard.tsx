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

import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useStore } from "simstate";
import { requireAuth } from "src/auth/requireAuth";
import { useI18nTranslateToString } from "src/i18n";
import { OveriewTable } from "src/pageComponents/dashboard/OveriewTable";
import { UserStore } from "src/stores/UserStore";
import { Head } from "src/utils/head";

interface Props {
  homeText: string;
  homeTitle: string;
}

export const DashboardPage: NextPage<Props> = requireAuth(() => true)((props: Props) => {

  const userStore = useStore(UserStore);
  const router = useRouter();

  useEffect(() => {
    router.replace(router.asPath);
  }, [userStore.user]);

  const t = useI18nTranslateToString();

  const data = [
    {
      clusterName:"集群1",
      partitionName:"分区1",
      nodes:20,
      runningNodes:4,
      idleNodes:10,
      noAviailableNodes:6,
      cpuCores:10,
      runningCpus:5,
      idleCpus:3,
      noAviailableCpus:2,
      gpuCores:12,
      runningGpus:5,
      idleGpus:3,
      noAviailableGpus:4,
      jobNum:100,
      runningJob:80,
      pendingJob:20,
      usageRate:"40%",
      status:"可用",
    },
    {
      clusterName:"集群2",
      partitionName:"分区1",
      nodes:7,
      runningNodes:5,
      idleNodes:1,
      noAviailableNodes:1,
      cpuCores:10,
      runningCpus:5,
      idleCpus:3,
      noAviailableCpus:2,
      gpuCores:14,
      runningGpus:7,
      idleGpus:3,
      noAviailableGpus:4,
      jobNum:100,
      runningJob:80,
      pendingJob:20,
      usageRate:"40%",
      status:"可用",
    },
    {
      clusterName:"集群3",
      partitionName:"分区1",
      nodes:19,
      runningNodes:15,
      idleNodes:2,
      noAviailableNodes:2,
      cpuCores:10,
      runningCpus:5,
      idleCpus:3,
      noAviailableCpus:2,
      gpuCores:12,
      runningGpus:5,
      idleGpus:3,
      noAviailableGpus:4,
      jobNum:120,
      runningJob:90,
      pendingJob:30,
      usageRate:"50%",
      status:"不可用",
    },
  ];

  return (
    <div>
      <Head title={t("pages.dashboard.title")} />
      {/* <CustomizableLogoAndText homeText={props.homeText} homeTitle={props.homeTitle} /> */}
      <OveriewTable clusterInfo={data.map((item, idx) => ({ ...item, id:idx }))} />
    </div>
  );
});

export default DashboardPage;
