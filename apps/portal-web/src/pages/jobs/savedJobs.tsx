import { NextPage } from "next";
import { requireAuth } from "src/auth/requireAuth";
import { PageTitle } from "src/components/PageTitle";
import { SavedJobsTable } from "src/pageComponents/job/SavedJobsTable";
import { Head } from "src/utils/head";

export const SavedJobsPage: NextPage = requireAuth(() => true)(
  () => {
    return (
      <div>
        <Head title="已保存的作业" />
        <PageTitle titleText={"已保存的作业"} />
        <SavedJobsTable />
      </div>
    );

  });

export default SavedJobsPage;
