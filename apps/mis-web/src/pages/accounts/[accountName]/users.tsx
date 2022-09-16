import { Divider, Space } from "antd";
import { NextPage } from "next";
import { useCallback } from "react";
import { useAsync } from "react-async";
import { api } from "src/apis";
import { requireAuth } from "src/auth/requireAuth";
import { PageTitle } from "src/components/PageTitle";
import { UserRole } from "src/models/User";
import { useAccountPagesAccountName } from "src/pageComponents/accounts/checkQueryAccountNameIsAdmin";
import { AddUserButton } from "src/pageComponents/users/AddUserButton";
import { UserTable } from "src/pageComponents/users/UserTable";
import { Head } from "src/utils/head";
import { RefreshLink, useRefreshToken } from "src/utils/refreshToken";

export const UsersPage: NextPage = requireAuth(
  (i) => i.accountAffiliations.some((x) => x.role !== UserRole.USER),
)(
  ({ userStore }) => {

    const accountName = useAccountPagesAccountName();

    const account = userStore.user.accountAffiliations.find((x) => x.accountName === accountName)!;

    const promiseFn = useCallback(async () => {
      return await api.getAccountUsers({ query: {
        accountName,
      } });
    }, [accountName]);

    const [refreshToken, update] = useRefreshToken();

    const { data, isLoading, reload } = useAsync({ promiseFn, watch: refreshToken });

    const title = `账户${accountName}用户管理`;

    return (
      <div>
        <Head title={title} />
        <PageTitle
          titleText={title}
        >
          <Space split={<Divider type="vertical" />}>
            <AddUserButton refresh={reload} accountName={account.accountName}/>
            <RefreshLink refresh={update}/>
          </Space>
        </PageTitle>
        <UserTable
          data={data}
          isLoading={isLoading}
          reload={reload}
          accountName={accountName}
          canSetAdmin={account.role === UserRole.OWNER}
          getJobsPageUrl={(userId) => ({
            pathname: `/accounts/${accountName}/userJobs`,
            query: { userId },
          })}
        />
      </div>
    );
  });

export default UsersPage;
