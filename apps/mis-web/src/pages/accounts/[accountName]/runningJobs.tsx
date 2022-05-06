import { NextPage } from "next";
import { requireAuth } from "src/auth/requireAuth";
import { PageTitle } from "src/components/PageTitle";
import {
  checkQueryAccountNameIsAdmin,
  useAccountPagesAccountName } from "src/pageComponents/accounts/checkQueryAccountNameIsAdmin";
import { RunningJobQueryTable } from "src/pageComponents/job/RunningJobTable";
import { Head } from "src/utils/head";

export const RunningJobsPage: NextPage = requireAuth(
  (u) => u.accountAffiliations.length > 0,
  checkQueryAccountNameIsAdmin,
)(
  () => {

    const accountName = useAccountPagesAccountName();
    const title = `账户${accountName}未结束的作业`;

    return (
      <div>
        <Head title={title} />
        <PageTitle titleText={title} />
        <RunningJobQueryTable
          accountNames={accountName}
          showAccount={false}
          filterAccountName={false}
          showUser={true}
        />
      </div>

    );

  });

export default RunningJobsPage;
