import { message, Select, Table, Tabs, Typography } from "antd";
import { useEffect, useState } from "react";
import { useAsync } from "react-async";
import { api } from "src/apis";
import { Centered } from "src/components/layouts";
import { Account } from "src/generated/server/account";
import { AccountAffiliation, User } from "src/generated/server/user";
import { FormLayout } from "src/layouts/FormLayout";
import { useMessage } from "src/layouts/prompts";
import { PlatformRole, PlatformRoleTexts, TenantRole, TenantRoleTexts, UserRole, UserRoleTexts } from "src/models/User";

interface DataTableProps<T> {
  data: T[] | undefined;
  loading: boolean;
  reload: () => void;
}

interface PlatformRoleSelectorProps {
  role: PlatformRole[];
  userId: string;
  reload: () => void;
}

const PlatformRoleSelector: React.FC<PlatformRoleSelectorProps> = ({ role, userId, reload }) => {
  const message = useMessage();

  const [loading, setLoading] = useState(false);
  const roleTexts: string[] = role.map((r) => PlatformRoleTexts[r]);
  return (
    <Select
      disabled={loading}
      defaultValue={roleTexts}
      style={{ width: "100%" }}
      onSelect={
        async (value: number) => {
          setLoading(true);
          await api.setPlatformRole({ body:{
            userId: userId,
            roleType: value,
          } })
            .httpError(200, () => { message.error("用户已经是该角色"); })
            .httpError(404, () => { message.error("用户不存在"); })
            .httpError(403, () => { message.error("用户没有权限"); })
            .then(() => {
              message.success("设置成功");
              setLoading(false);
              reload();
            });
        }
      }
      onDeselect={
        async (value: number) => {
          setLoading(true);
          await api.unsetPlatformRole({ body:{
            userId: userId,
            roleType: value,
          } })
            .httpError(200, () => { message.error("用户已经不是该角色"); })
            .httpError(404, () => { message.error("用户不存在"); })
            .httpError(403, () => { message.error("用户没有权限"); })
            .then(() => {
              message.success("设置成功");
              setLoading(false);
              reload();
            });
        }
      }
      mode="multiple"
      placeholder="Please select"
    >
      {
        Object.entries(PlatformRoleTexts).map(([key, value]) => {
          return <Select.Option key={key} value={key}>{value}</Select.Option>;
        })
      }
    </Select>
  );
};


interface TenantRoleSelectorProps {
  role: TenantRole[];
  userId: string;
  reload: () => void;
}

const TenantRoleSelector: React.FC<TenantRoleSelectorProps> = ({ role, userId, reload }) => {

  const [loading, setLoading] = useState(false);
  const roleTexts: string[] = role.map((r) => TenantRoleTexts[r]);
  return (
    <Select
      disabled={loading}
      defaultValue={roleTexts}
      style={{ width: "100%" }}
      onSelect={
        async (value: number) => {
          setLoading(true);
          await api.setTenantRole({ body:{
            userId: userId,
            roleType: value,
          } })
            .httpError(200, () => { message.error("用户已经是该角色"); })
            .httpError(404, () => { message.error("用户不存在"); })
            .httpError(403, () => { message.error("用户没有权限"); })
            .then(() => {
              message.success("设置成功");
              setLoading(false);
              reload();
            });
        }
      }
      onDeselect={
        async (value: number) => {
          setLoading(true);
          await api.unsetTenantRole({ body:{
            userId: userId,
            roleType: value,
          } })
            .httpError(200, () => { message.error("用户已经不是该角色"); })
            .httpError(404, () => { message.error("用户不存在"); })
            .httpError(403, () => { message.error("用户没有权限"); })
            .then(() => {
              message.success("设置成功");
              setLoading(false);
              reload();
            });
        }
      }
      mode="multiple"
      placeholder="Please select"
    >
      {
        Object.entries(TenantRoleTexts).map(([key, value]) => {
          return <Select.Option key={key} value={key}>{value}</Select.Option>;
        })
      }
    </Select>
  );
};


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
          <PlatformRoleSelector role={r.platformRoles} userId={r.userId} reload={reload} />
        )}
      />
      <Table.Column<User>
        dataIndex="tenantRoles"
        title="租户角色"
        width={200}
        render={(_, r) => (
          <TenantRoleSelector role={r.tenantRoles} userId={r.userId} reload={reload} />
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
