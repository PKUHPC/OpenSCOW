import { NextPage } from "next";
import { requireAuth } from "src/auth/requireAuth";
import { PageTitle } from "src/components/PageTitle";
import { AllTenantsTable } from "src/pageComponents/admin/AllTenantsTable";
import { Head } from "src/utils/head";
import { RefreshLink, useRefreshToken } from "src/utils/refreshToken";
export const showAllTenants :NextPage = requireAuth(() => true)(({ userStore: { user } }) => {
    
  const [refreshToken, update] = useRefreshToken();
  return (
    <div>
      <Head title="平台租户列表" />
      <PageTitle titleText={"平台租户列表"}>
        <RefreshLink refresh={update} />
      </PageTitle>
      <AllTenantsTable 
        refreshToken={refreshToken}
        user={user}
      />
    </div>
  );
});
export default showAllTenants;
