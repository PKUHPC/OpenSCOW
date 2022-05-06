import { NextPage } from "next";
import { requireAuth } from "src/auth/requireAuth";
import { PageTitle } from "src/components/PageTitle";
import {
  checkQueryAccountNameIsAdmin,
  useAccountPagesAccountName } from "src/pageComponents/accounts/checkQueryAccountNameIsAdmin";
import { JobTable } from "src/pageComponents/job/HistoryJobTable";
import { Head } from "src/utils/head";
export const HistoryJobsPage: NextPage = requireAuth(
  (u) => u.accountAffiliations.length > 0,
  checkQueryAccountNameIsAdmin,
)(
  () => {

    const accountName = useAccountPagesAccountName();

    const title = `账户${accountName}已结束的作业`;
    return (
      <div>
        <Head title={title} />
        <PageTitle titleText={title} />
        <JobTable
          accountNames={accountName}
          filterAccountName={false}
          showAccount={false}
          showUser={true}
          showedPrices={["account"]}
          priceTexts={{ account: "作业计费" }}
        />
      </div>

    );

  });

export default HistoryJobsPage;
