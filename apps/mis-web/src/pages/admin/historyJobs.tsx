import { NextPage } from "next";
import { requireAuth } from "src/auth/requireAuth";
import { PageTitle } from "src/components/PageTitle";
import { TenantRole } from "src/models/User";
import { AdminJobTable } from "src/pageComponents/admin/AdminJobTable";
import { Head } from "src/utils/head";

export const AdminJobsPage: NextPage = requireAuth((u) => u.tenantRoles.includes(TenantRole.TENANT_ADMIN))(
  () => {
    return (
      <div>
        <Head title="历史作业" />
        <PageTitle titleText={"历史作业"} />
        <AdminJobTable />
      </div>
    );

  });

export default AdminJobsPage;
