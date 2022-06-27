import { NextPage } from "next";
import { useCallback } from "react";
import { useAsync } from "react-async";
import { api } from "src/apis";
import { requireAuth } from "src/auth/requireAuth";
import { PageTitle } from "src/components/PageTitle";
import { TenantRole } from "src/models/User";
import { EditableJobBillingTable } from "src/pageComponents/job/EditableJobBillingTable";
import { Head } from "src/utils/head";

export const TenantAdminJobBillingTablePage: NextPage = requireAuth(
  (x) => x.tenantRoles.includes(TenantRole.TENANT_ADMIN),
)(
  ({ userStore }) => {

    const tenant = userStore.user.tenant;

    const { data, isLoading, reload } = useAsync({ promiseFn: useCallback(async () => {
      return await api.getBillingTable({ query: { tenant: tenant } }).then((x) => x.items);
    }, [userStore.user]) });

    return (
      <div>
        <Head title="管理本租户作业价格表" />
        <PageTitle titleText={`管理租户${tenant}作业价格表`} reload={reload} />
        <EditableJobBillingTable tenant={tenant} reload={reload} data={data} loading={isLoading} />
      </div>
    );
  });

export default TenantAdminJobBillingTablePage;
