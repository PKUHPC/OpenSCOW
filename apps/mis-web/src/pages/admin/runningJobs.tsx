import { NextPage } from "next";
import { requireAuth } from "src/auth/requireAuth";
import { PageTitle } from "src/components/PageTitle";
import { TenantRole } from "src/models/User";
import { RunningJobQueryTable } from "src/pageComponents/job/RunningJobTable";
import { Head } from "src/utils/head";

export const RunningJobsPage: NextPage = requireAuth((u) => u.tenantRoles.includes(TenantRole.TENANT_ADMIN))(
  () => {
    return (
      <div>
        <Head title="运行中的作业" />
        <PageTitle titleText={"运行中的作业"} />
        <RunningJobQueryTable
          showUser={true}
          showAccount={true}
          accountNames={undefined}
        />
      </div>
    );

  });

export default RunningJobsPage;
