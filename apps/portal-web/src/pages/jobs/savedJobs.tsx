import { NextPage } from "next";
import { requireAuth } from "src/auth/requireAuth";
import { PageTitle } from "src/components/PageTitle";
import { SavedJobsTable } from "src/pageComponents/job/SavedJobsTable";
import { Head } from "src/utils/head";

export const SavedJobsPage: NextPage = requireAuth(() => true)(
  () => {
    return (
      <div>
        <Head title="作业模板" />
        <PageTitle titleText={"作业模板列表"} />
        <SavedJobsTable />
      </div>
    );

  });

export default SavedJobsPage;
