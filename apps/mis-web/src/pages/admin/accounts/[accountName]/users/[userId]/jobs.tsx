import { NextPage } from "next";
import { useRouter } from "next/router";
import React from "react";
import { requireAuth } from "src/auth/requireAuth";
import { BackButton } from "src/components/BackButton";
import { PageTitle } from "src/components/PageTitle";
import { TenantRole } from "src/models/User";
import { JobTable } from "src/pageComponents/job/HistoryJobTable";
import { Head } from "src/utils/head";
import { queryToString } from "src/utils/querystring";

export const JobsPage: NextPage = requireAuth((u) => u.tenantRoles.includes(TenantRole.TENANT_ADMIN))(
  () => {

    const router = useRouter();

    const userId = queryToString(router.query.userId);
    const accountName = queryToString(router.query.accountName);

    const title = `${userId}在${accountName}中执行过的作业列表`;

    return (
      <div>
        <Head title={title} />
        <PageTitle
          beforeTitle={(
            <BackButton href={`/admin/accounts/${accountName}/users`} />
          )}
          titleText={title}
        />
        <JobTable
          userId={userId}
          accountNames={accountName}
          filterUser={false}
          showAccount={false}
          showUser={false}
          showedPrices={["account", "tenant"]}
        />
      </div>
    );

  });

export default JobsPage;
