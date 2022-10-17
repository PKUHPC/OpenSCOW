import { NextPage } from "next";
import { requireAuth } from "src/auth/requireAuth";
import { PageTitle } from "src/components/PageTitle";
import { PlatformRole } from "src/models/User";
import { Head } from "src/utils/head";

export const TenantPaymentsPage: NextPage = requireAuth((i) => 
  i.platformRoles.includes(PlatformRole.PLATFORM_ADMIN),
)(() => {
  return (
    <div>
      <Head title="充值记录" />
      <PageTitle titleText="充值记录" />
      {/*  */}
    </div>
  );
});

export default TenantPaymentsPage;