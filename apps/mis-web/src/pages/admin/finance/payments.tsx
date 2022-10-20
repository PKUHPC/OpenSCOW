import { NextPage } from "next";
import { requireAuth } from "src/auth/requireAuth";
import { PageTitle } from "src/components/PageTitle";
import { PlatformRole } from "src/models/User";
import { TenantPaymentTable } from "src/pageComponents/admin/TenantPaymentTable";
import { Head } from "src/utils/head";

export const TenantPaymentsPage: NextPage = requireAuth((i) => 
  i.platformRoles.includes(PlatformRole.PLATFORM_FINANCE),
)(() => {
  return (
    <div>
      <Head title="充值记录" />
      <PageTitle titleText="充值记录" />
      <TenantPaymentTable
        showTenantName={true}
        showAuditInfo={true}
      />
    </div>
  );
});

export default TenantPaymentsPage;