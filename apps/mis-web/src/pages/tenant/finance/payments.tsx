import { NextPage } from "next";
import { requireAuth } from "src/auth/requireAuth";
import { PageTitle } from "src/components/PageTitle";
import { TenantRole } from "src/models/User";
import { PaymentTable } from "src/pageComponents/finance/PaymentTable";
import { Head } from "src/utils/head";

export const PaymentsPage: NextPage = requireAuth((i) =>
  i.tenantRoles.includes(TenantRole.TENANT_FINANCE),
)(() => {
  return (
    <div>
      <Head title="充值记录" />
      <PageTitle titleText="充值记录" />
      <PaymentTable
        showAccountName={true}
        showAuditInfo={true}
      />
    </div>
  );
});

export default PaymentsPage;
