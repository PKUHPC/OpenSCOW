import { NextPage } from "next";
import { requireAuth } from "src/auth/requireAuth";
import { PageTitle } from "src/components/PageTitle";
import { FormLayout } from "src/layouts/FormLayout";
import { PlatformRole } from "src/models/User";
import { Head } from "src/utils/head";

export const TenantFinancePayPage: NextPage = requireAuth((i) => i.platformRoles.includes(PlatformRole.PLATFORM_ADMIN))(
  () => {
    return (
      <div>
        <Head title="租户充值" />
        <PageTitle titleText="租户充值" />
        <FormLayout>
          {/*  */}
        </FormLayout>
      </div>
    );
  });

export default TenantFinancePayPage;