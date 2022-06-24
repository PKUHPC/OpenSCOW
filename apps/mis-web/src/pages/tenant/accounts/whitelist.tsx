import { Divider, Space } from "antd";
import { NextPage } from "next";
import { useCallback } from "react";
import { useAsync } from "react-async";
import { api } from "src/apis";
import { requireAuth } from "src/auth/requireAuth";
import { PageTitle } from "src/components/PageTitle";
import { TenantRole } from "src/models/User";
import { AccountWhitelistTable } from "src/pageComponents/tenant/AccountWhitelistTable";
import { AddWhitelistedAccountButton } from "src/pageComponents/tenant/AddWhitelistedAccountButton";
import { Head } from "src/utils/head";
import { RefreshLink, useRefreshToken } from "src/utils/refreshToken";

export const AccountWhitelistPage: NextPage = requireAuth((u) => u.tenantRoles.includes(TenantRole.TENANT_ADMIN))(
  () => {

    const promiseFn = useCallback(async () => {
      return await api.getWhitelistedAccounts({});
    }, []);

    const [refreshToken, update] = useRefreshToken();

    const { data, isLoading, reload } = useAsync({ promiseFn, watch: refreshToken });

    return (
      <div>
        <Head title="白名单账户" />
        <PageTitle titleText={"白名单账户列表"} >
          <Space split={<Divider type="vertical" />}>
            <AddWhitelistedAccountButton refresh={reload} />
            <RefreshLink refresh={update}/>
          </Space>
        </PageTitle>
        <AccountWhitelistTable
          data={data}
          isLoading={isLoading}
          reload={reload}
        />
      </div>
    );

  });

export default AccountWhitelistPage;
