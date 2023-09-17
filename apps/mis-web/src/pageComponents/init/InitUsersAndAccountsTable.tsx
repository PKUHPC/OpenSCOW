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
import { PlatformRoleSelector } from "src/components/PlatformRoleSelector";
import { TenantRoleSelector } from "src/components/TenantRoleSelector";
import { prefix, useI18nTranslateToString } from "src/i18n";
import { UserRole, UserRoleTexts } from "src/models/User";


interface DataTableProps<T> {
  data: T[] | undefined;
  loading: boolean;
  reload: () => void;
}

const p = prefix("pageComp.init.initUsersAndAccountsTable.");
const pCommon = prefix("common.");

const UserTable: React.FC<DataTableProps<User>> = ({ data, loading, reload }) => {

  const t = useI18nTranslateToString();

  return (
    <Table
      loading={loading}
      dataSource={data}
      scroll={{ x: true }}
      bordered
      rowKey="userId"
    >
      <Table.Column<User> dataIndex="userId" title={t(pCommon("userId"))} />
      <Table.Column<User> dataIndex="name" title={t(pCommon("name"))} />
      <Table.Column<User>
        dataIndex="platformRoles"
        title={t(p("platformRole"))}
        width={200}
        render={(_, r) => (
          <PlatformRoleSelector roles={r.platformRoles} userId={r.userId} reload={reload} />
        )}
      />
      <Table.Column<User>
        dataIndex="tenantRoles"
        title={t(p("tenantRole"))}
        width={200}
        render={(_, r) => (
          <TenantRoleSelector roles={r.tenantRoles} userId={r.userId} reload={reload} />
        )}
      />
      <Table.Column
        dataIndex="accountAffiliations"
        title={t(p("accountAffiliation"))}
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

  const t = useI18nTranslateToString();

  return (
    <Table
      loading={loading}
      dataSource={data}
      scroll={{ x: true }}
      pagination={{ showSizeChanger: true }}
      rowKey="accountName"
      bordered
    >
      <Table.Column<Account> dataIndex="accountName" title={t(pCommon("accountName"))} />
      <Table.Column<Account>
        dataIndex="ownerName"
        title={t(pCommon("owner"))}
        render={(_, r) => `${r.ownerName} (id: ${r.ownerId})`}
      />
    </Table>
  );
};

const usersPromiseFn = async () => (await api.initGetUsers({})).users;
const accountsPromiseFn = async () => (await api.initGetAccounts({})).accounts;

export const InitUsersAndAccountsTable: React.FC = () => {

  const t = useI18nTranslateToString();

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
    <div>
      <FormLayout maxWidth={800}>
        <Typography.Paragraph>
          {t(p("defaultTenant"))}<strong>{t(p("initAdmin"))}</strong>。
        </Typography.Paragraph>
        <Typography.Paragraph>
          <strong>{t(p("initAdmin"))}</strong>{t(p("set"))}
        </Typography.Paragraph>
        <Tabs defaultActiveKey="user" tabBarExtraContent={<a onClick={reload}>{t(pCommon("fresh"))}</a>}>
          <Tabs.TabPane tab={t(pCommon("user"))} key="user">
            <UserTable data={usersData} loading={usersLoading} reload={usersReload} />
          </Tabs.TabPane>
          <Tabs.TabPane tab={t(pCommon("account"))} key="account">
            <AccountTable data={accountsData} loading={accountsLoading} reload={accountsReload} />
          </Tabs.TabPane>
        </Tabs>
      </FormLayout>
    </div>
  );

};
