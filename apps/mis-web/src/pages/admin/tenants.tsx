import { Divider, Space } from "antd";
import { NextPage } from "next";
import { requireAuth } from "src/auth/requireAuth";
import { PageTitle } from "src/components/PageTitle";
import { AllTenantsTable } from "src/pageComponents/admin/AllTenantsTable";
import { AddTenantButton } from "src/pageComponents/tenant/AddTenantButton";
import { Head } from "src/utils/head";
import { RefreshLink, useRefreshToken } from "src/utils/refreshToken";


export const showAllTenants :NextPage = requireAuth(() => true)(() => {
    
  const [refreshToken, update] = useRefreshToken();
  return (
    <div>
      <Head title="平台租户列表" />
      <PageTitle titleText={"平台租户列表"}>
        <Space split={<Divider type="vertical" />}>
          <AddTenantButton refresh={update} />
          <RefreshLink refresh={update} />
        </Space>
      </PageTitle>
      <AllTenantsTable 
        refreshToken={refreshToken}
      />
    </div>
  );
});
export default showAllTenants;
