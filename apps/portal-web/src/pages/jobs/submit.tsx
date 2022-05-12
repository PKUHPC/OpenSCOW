import { NextPage } from "next";
import { requireAuth } from "src/auth/requireAuth";
import { PageTitle } from "src/components/PageTitle";
import { SubmitJobForm } from "src/pageComponents/job/SubmitJobForm";
import { Head } from "src/utils/head";

export const SubmitJobPage: NextPage = requireAuth(() => true)(
  () => {
    return (
      <div>
        <Head title="提交作业" />
        <PageTitle titleText={"提交作业"} />
        <SubmitJobForm />
      </div>
    );

  });

export default SubmitJobPage;
