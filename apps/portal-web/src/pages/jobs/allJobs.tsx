import { NextPage } from "next";
import { requireAuth } from "src/auth/requireAuth";
import { PageTitle } from "src/components/PageTitle";
import { AllJobQueryTable } from "src/pageComponents/job/AllJobsTable";
import { Head } from "src/utils/head";

export const AllJobsPage: NextPage = requireAuth(() => true)(
  ({ userStore }) => {
    return (
      <div>
        <Head title="历史作业" />
        <PageTitle titleText={"本用户所有历史作业"} />
        <AllJobQueryTable
          userId={userStore.user.identityId}
        />
      </div>

    );

  });

export default AllJobsPage;
