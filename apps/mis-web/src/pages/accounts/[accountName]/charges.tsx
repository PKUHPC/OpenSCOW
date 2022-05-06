import { NextPage } from "next";
import { requireAuth } from "src/auth/requireAuth";
import { PageTitle } from "src/components/PageTitle";
import { UserRole } from "src/models/User";
import {
  checkQueryAccountNameIsAdmin,
  useAccountPagesAccountName } from "src/pageComponents/accounts/checkQueryAccountNameIsAdmin";
import { ChargeTable } from "src/pageComponents/finance/ChargeTable";
import { Head } from "src/utils/head";

export const ChargesPage: NextPage = requireAuth(
  (i) => i.accountAffiliations.some((x) => x.role !== UserRole.USER),
  checkQueryAccountNameIsAdmin,
)(() => {

  const accountName = useAccountPagesAccountName();

  const title =`账户${accountName}扣费记录`;

  return (
    <div>
      <Head title={title} />
      <PageTitle titleText={title}>
      </PageTitle>
      <ChargeTable showAccountName={false} accountName={accountName} />
    </div>
  );
});

export default ChargesPage;
