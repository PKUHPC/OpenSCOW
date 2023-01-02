/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * SCOW is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import { FormLayout } from "@scow/lib-web/build/layouts/FormLayout";
import { Account } from "@scow/protos/build/server/account";
import { AccountAffiliation, User } from "@scow/protos/build/server/user";
import { Table, Tabs, Typography } from "antd";
import { useEffect } from "react";
import { useAsync } from "react-async";
import { api } from "src/apis";
import { Centered } from "src/components/layouts";
import { PlatformRoleSelector } from "src/components/PlatformRoleSelector";
import { TenantRoleSelector } from "src/components/TenantRoleSelector";
import { UserRole, UserRoleTexts } from "src/models/User";

interface DataTableProps<T> {
  data: T[] | undefined;
  loading: boolean;
  reload: () => void;
}

const UserTable: React.FC<DataTableProps<User>> = ({ data, loading, reload }) => {
  return (
    <Table
      loading={loading}
      dataSource={data}
      scroll={{ x: true }}
      bordered
      rowKey="userId"
    >
      <Table.Column<User> dataIndex="userId" title="用户ID" />
      <Table.Column<User> dataIndex="name" title="姓名" />
      <Table.Column<User>
        dataIndex="platformRoles"
        title="平台角色"
        width={200}
        render={(_, r) => (
          <PlatformRoleSelector roles={r.platformRoles} userId={r.userId} reload={reload} />
        )}
      />
      <Table.Column<User>
        dataIndex="tenantRoles"
        title="租户角色"
        width={200}
        render={(_, r) => (
          <TenantRoleSelector roles={r.tenantRoles} userId={r.userId} reload={reload} />
        )}
      />
      <Table.Column
        dataIndex="accountAffiliations"
        title="所属账户"
        render={(accounts: AccountAffiliation[]) => accounts
          .map((x) =>
            x.accountName +
              (x.role !== UserRole.USER ? `(${UserRoleTexts[x.role]})` : ""),
          ).join(", ")}
      />
    </Table>
  );
};

const AccountTable: React.FC<DataTableProps<Account>> = ({ data, loading }) => {
  return (
    <Table
      loading={loading}
      dataSource={data}
      scroll={{ x: true }}
      pagination={{ showSizeChanger: true }}
      rowKey="accountName"
      bordered
    >
      <Table.Column<Account> dataIndex="accountName" title="账户名" />
      <Table.Column<Account>
        dataIndex="ownerName"
        title="拥有者"
        render={(_, r) => `${r.ownerName} (id: ${r.ownerId})`}
      />
    </Table>
  );
};

const usersPromiseFn = async () => (await api.initGetUsers({})).users;
const accountsPromiseFn = async () => (await api.initGetAccounts({})).accounts;

export const InitUsersAndAccountsTable: React.FC = () => {

  const { data: usersData, isLoading: usersLoading, reload: usersReload } = useAsync({ promiseFn: usersPromiseFn });
  const {
    data: accountsData, isLoading: accountsLoading, reload: accountsReload,
  } = useAsync({ promiseFn: accountsPromiseFn });

  const reload = () => {
    usersReload();
    accountsReload();
  };

  useEffect(() => {
    reload();
  }, []);

  return (
    <Centered>
      <FormLayout maxWidth={800}>
        <Typography.Paragraph>
          您可以在这里管理当前系统中默认租户下的用户和账户，以及设置某个用户为<strong>初始管理员</strong>。
        </Typography.Paragraph>
        <Typography.Paragraph>
          <strong>初始管理员</strong>指同时为租户管理员和平台管理员的用户。
        </Typography.Paragraph>
        <Tabs defaultActiveKey="user" tabBarExtraContent={<a onClick={reload}>刷新</a>}>
          <Tabs.TabPane tab="用户" key="user">
            <UserTable data={usersData} loading={usersLoading} reload={usersReload} />
          </Tabs.TabPane>
          <Tabs.TabPane tab="账户" key="account">
            <AccountTable data={accountsData} loading={accountsLoading} reload={accountsReload} />
          </Tabs.TabPane>
        </Tabs>
      </FormLayout>
    </Centered>
  );

};
