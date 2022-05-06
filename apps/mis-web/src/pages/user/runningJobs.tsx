import { NextPage } from "next";
import { requireAuth } from "src/auth/requireAuth";
import { PageTitle } from "src/components/PageTitle";
import { RunningJobQueryTable } from "src/pageComponents/job/RunningJobTable";
import { Head } from "src/utils/head";

export const RunningJobsPage: NextPage = requireAuth((u) => u.accountAffiliations.length > 0)(
  ({ userStore }) => {
    return (
      <div>
        <Head title="未结束的作业" />
        <PageTitle titleText={"本用户未结束的作业"} />
        <RunningJobQueryTable
          userId={userStore.user.identityId}
          accountNames={userStore.user.accountAffiliations.map((x) => x.accountName)}
          showAccount={true}
          showUser={false}
        />
      </div>

    );

  });

export default RunningJobsPage;
