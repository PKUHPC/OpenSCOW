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

import { queryToString } from "@scow/lib-web/build/utils/querystring";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { requireAuth } from "src/auth/requireAuth";
import { BackButton } from "src/components/BackButton";
import { PageTitle } from "src/components/PageTitle";
import { UserRole } from "src/models/User";
import { JobTable } from "src/pageComponents/job/HistoryJobTable";
import { Head } from "src/utils/head";

export const UserJobsPage: NextPage = requireAuth(
  (i) => i.accountAffiliations.some((x) => x.role !== UserRole.USER),
)(
  () => {

    const router = useRouter();

    const userId = queryToString(router.query.userId) || undefined;
    const accountName = queryToString(router.query.accountName) || "";

    const title = `用户${userId}在账户${accountName}下运行的作业`;

    return (
      <div>
        <Head title={title} />
        <PageTitle
          beforeTitle={(
            <BackButton href={`/accounts/${accountName}/users`} />
          )}
          titleText={title}
        />
        <JobTable
          userId={userId}
          accountNames={accountName}
          showAccount={false}
          showUser={false}
          showedPrices={["account"]}
          priceTexts={{ account: "作业计费" }}
        />
      </div>
    );
  });

export default UserJobsPage;
