import { NextPage } from "next";
import { requireAuth } from "src/auth/requireAuth";
import { PageTitle } from "src/components/PageTitle";
import { JobTable } from "src/pageComponents/job/HistoryJobTable";
import { Head } from "src/utils/head";

export const JobsPage: NextPage = requireAuth((u) => u.accountAffiliations.length > 0)(
  ({ userStore }) => {
    return (
      <div>
        <Head title="历史作业" />
        <PageTitle titleText={"本用户已结束的作业"} />
        <JobTable
          accountNames={userStore.user.accountAffiliations.map((x) => x.accountName)}
          userId={userStore.user.identityId}
          showAccount={true}
          showUser={false}
          filterUser={false}
          showedPrices={["account"]}
          priceTexts={{ account: "作业计费" }}
        />
      </div>
    );

  });

export default JobsPage;
