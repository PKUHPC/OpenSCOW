import { NextPage } from "next";
import { requireAuth } from "src/auth/requireAuth";
import { PageTitle } from "src/components/PageTitle";
import { FormLayout } from "src/layouts/FormLayout";
import { TenantRole } from "src/models/User";
import { ChargeForm } from "src/pageComponents/finance/ChargeForm";
import { Head } from "src/utils/head";

export const FinancePayPage: NextPage = requireAuth((i) => i.tenantRoles.includes(TenantRole.TENANT_FINANCE))(
  () => {
    return (
      <div>
        <Head title="账户充值" />
        <PageTitle titleText="账户充值" />
        <FormLayout>
          <ChargeForm />
        </FormLayout>
      </div>
    );
  });

export default FinancePayPage;
