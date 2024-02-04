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

import { usePublicConfig } from "src/app/(auth)/context";
import { PageTitle } from "src/components/PageTitle";
import { NotFoundPage } from "src/layouts/error/NotFoundPage";

import { AppSessionsTable, AppTableStatus } from "../AppSessionsTable";

export default function Page({ params }: {params: {clusterId: string}}) {
  const { clusterId } = params;

  const { publicConfig } = usePublicConfig();
  const cluster = publicConfig.CLUSTERS.find((x) => x.id === clusterId);


  if (!cluster) {
    return <NotFoundPage />;
  }

  return (
    <>
      <PageTitle
        titleText="已完成的作业"
      />
      <AppSessionsTable cluster={cluster} status={AppTableStatus.FINISHED} />
    </>
  );
}
