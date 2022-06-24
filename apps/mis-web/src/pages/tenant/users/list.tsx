import { NextPage } from "next";
import { useCallback } from "react";
import { useAsync } from "react-async";
import { api } from "src/apis";
import { requireAuth } from "src/auth/requireAuth";
import { PageTitle } from "src/components/PageTitle";
import { TenantRole } from "src/models/User";
import { AdminUserTable } from "src/pageComponents/tenant/AdminUserTable";
import { Head } from "src/utils/head";
import { RefreshLink, useRefreshToken } from "src/utils/refreshToken";

export const AdminUsersPage: NextPage = requireAuth((u) => u.tenantRoles.includes(TenantRole.TENANT_ADMIN))(
  () => {

    const promiseFn = useCallback(async () => {
      return await api.getTenantUsers({ });
    }, []);

    const [refreshToken, update] = useRefreshToken();

    const { data, isLoading, reload } = useAsync({ promiseFn, watch: refreshToken });

    return (
      <div>
        <Head title="用户列表" />
        <PageTitle titleText={"用户列表"} >
          <RefreshLink refresh={update}/>
        </PageTitle>
        <AdminUserTable
          data={data}
          isLoading={isLoading}
          reload={reload}
        />
      </div>
    );

  });

export default AdminUsersPage;
