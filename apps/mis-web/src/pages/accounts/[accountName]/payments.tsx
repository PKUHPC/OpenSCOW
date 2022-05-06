import { NextPage } from "next";
import { requireAuth } from "src/auth/requireAuth";
import { PageTitle } from "src/components/PageTitle";
import { UserRole } from "src/models/User";
import {
  checkQueryAccountNameIsAdmin,
  useAccountPagesAccountName } from "src/pageComponents/accounts/checkQueryAccountNameIsAdmin";
import { PaymentTable } from "src/pageComponents/finance/PaymentTable";
import { Head } from "src/utils/head";

export const PaymentsPage: NextPage = requireAuth(
  (i) => i.accountAffiliations.some((x) => x.role !== UserRole.USER),
  checkQueryAccountNameIsAdmin,
)(() => {

  const accountName = useAccountPagesAccountName();
  const title = `账户${accountName}充值记录`;

  return (
    <div>
      <Head title={title} />
      <PageTitle titleText={title} />
      <PaymentTable
        accountNames={[accountName]}
        showAccountName={false}
        showAuditInfo={false}
      />
    </div>
  );
});

export default PaymentsPage;
