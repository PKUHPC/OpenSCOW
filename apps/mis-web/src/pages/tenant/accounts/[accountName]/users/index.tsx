import { Divider, message, Space } from "antd";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useCallback } from "react";
import { useAsync } from "react-async";
import { api } from "src/apis";
import { requireAuth } from "src/auth/requireAuth";
import { BackButton } from "src/components/BackButton";
import { PageTitle } from "src/components/PageTitle";
import { TenantRole } from "src/models/User";
import { AddUserButton } from "src/pageComponents/users/AddUserButton";
import { UserTable } from "src/pageComponents/users/UserTable";
import { Head } from "src/utils/head";
import { queryToString } from "src/utils/querystring";
import { RefreshLink, useRefreshToken } from "src/utils/refreshToken";

export const AccountUsersPage: NextPage = requireAuth(
  (i) => i.tenantRoles.includes(TenantRole.TENANT_ADMIN),
)(
  ({ userStore }) =>  {

    const router = useRouter();

    const accountName = queryToString(router.query.accountName);

    const promiseFn = useCallback(async () => {
      if (!accountName) { return undefined; }
      return await api.getAccountUsers({ query: {
        accountName,
      } })
        .httpError(403, () => {
          message.error(`您不能管理账户${accountName}的用户。`);
          return undefined;
        });
    }, [userStore.user]);

    const [refreshToken, update] = useRefreshToken();

    const { data, isLoading, reload } = useAsync({ promiseFn, watch: refreshToken });

    const title = `账户${accountName}的用户`;

    return (
      <div>
        <Head title={title} />
        <PageTitle
          beforeTitle={(
            <BackButton href={"/tenant/accounts/list"} />
          )}
          titleText={title}
        >
          <Space split={<Divider type="vertical" />}>
            <AddUserButton refresh={reload} accountName={accountName}/>
            <RefreshLink refresh={update}/>
          </Space>
        </PageTitle>
        <UserTable
          canSetAdmin={true}
          reload={reload}
          accountName={accountName}
          data={data}
          isLoading={isLoading}
          getJobsPageUrl={(userId) => `/tenant/accounts/${accountName}/users/${userId}/jobs`}
        />
      </div>
    );
  });

export default AccountUsersPage;
