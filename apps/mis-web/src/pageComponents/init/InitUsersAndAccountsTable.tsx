import { flatIndent } from "@codemirror/language";
import { message, Select, Table } from "antd";
import { useEffect, useState } from "react";
import { useAsync } from "react-async";
import { api } from "src/apis";
import { Centered } from "src/components/layouts";
import { Account } from "src/generated/server/account";
import { AccountAffiliation, User } from "src/generated/server/user";
import { PlatformRole, PlatformRoleTexts, TenantRole, TenantRoleTexts, UserRole, UserRoleTexts } from "src/models/User";
import styled from "styled-components";

interface DataTableProps<T> {
  data: T[] | undefined;
  loading: boolean;
  reload: () => void;
}

const Title = styled.div`
  display: flex;
  justify-content: space-between;
`;

// PlatformRolesSelect的children
const PlatformRolesChildren : React.ReactNode[] = [];
Object.entries(PlatformRole).forEach(([, value]) => {
  if (typeof value === "number") {
    PlatformRolesChildren.push(
      <Select.Option value={value}>
        {PlatformRoleTexts[value]}
      </Select.Option>);
  }
});

// TenantRolesSelect的children
const TenantRolesChildren : React.ReactNode[] = [];
Object.entries(TenantRole).forEach(([, value]) => {
  if (typeof value === "number") {
    TenantRolesChildren.push(
      <Select.Option value={value}>
        {TenantRoleTexts[value]}
      </Select.Option>);
  }
});

interface SelectProps {
  roletype: "platform" | "tenant";
  role: PlatformRole[] | TenantRole[];
  userid: string;
  reloadfunction: () => void;
}


const SelectWithLoading: React.FC<SelectProps> = ({ roletype, role, userid, reloadfunction }) => {
  const [loading, setLoading] = useState(true);
  return (
    roletype === "platform" ? 
      (
        <Select
          disabled={loading}
          defaultValue={role}
          style={{ width: "100%" }}
          onSelect={
            async (value: number) => {
              setLoading(true);
              await api.setPlatformRole({ body:{
                userId: userid,
                roleType: value,
              } })
                .httpError(200, () => { message.error("用户已经是该角色"); })
                .httpError(400, () => { message.error("用户不存在"); })
                .httpError(401, () => { message.error("用户没有权限"); })
                .then(() => {
                  message.success("设置成功");
                  setLoading(false);
                  reloadfunction();
                });
            }
          }
          onDeselect={
            async (value: number) => {
              setLoading(true);
              await api.unsetPlatformRole({ body:{
                userId: userid,
                roleType: value,
              } })
                .httpError(200, () => { message.error("用户已经不是该角色"); })
                .httpError(400, () => { message.error("用户不存在"); })
                .httpError(401, () => { message.error("用户没有权限"); })
                .then(() => {
                  message.success("设置成功");
                  setLoading(false);
                  reloadfunction();
                });
            }
          }
          mode="multiple"
          placeholder="Please select"
        >
          {PlatformRolesChildren}
        </Select>
      ) : (
        <Select
          disabled={loading}
          defaultValue={role}
          style={{ width: "100%" }}
          onSelect={
            async (value: number) => {
              setLoading(true);
              await api.setTenantRole({ body:{
                userId: userid,
                roleType: value,
              } })
                .httpError(200, () => { message.error("用户已经是该角色"); })
                .httpError(400, () => { message.error("用户不存在"); })
                .httpError(401, () => { message.error("用户没有权限"); })
                .then(() => {
                  message.success("设置成功");
                  setLoading(false);
                  reloadfunction();
                });
            }
          }
          onDeselect={
            async (value: number) => {
              setLoading(true);
              await api.unsetTenantRole({ body:{
                userId: userid,
                roleType: value,
              } })
                .httpError(200, () => { message.error("用户已经不是该角色"); })
                .httpError(400, () => { message.error("用户不存在"); })
                .httpError(401, () => { message.error("用户没有权限"); })
                .then(() => {
                  message.success("设置成功");
                  setLoading(false);
                  reloadfunction();
                });
            }
          }
          mode="multiple"
          placeholder="Please select"
        >
          {PlatformRolesChildren}
        </Select>
      )
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
      title={() => <Title><span>用户</span><a onClick={reload}>刷新</a></Title>}
    >
      <Table.Column<User> dataIndex="userId" title="用户ID" />
      <Table.Column<User> dataIndex="name" title="姓名" />
      <Table.Column<User>
        dataIndex="platformRoles"
        title="平台角色"
        width={200}
        render={(_, r) => (
          <SelectWithLoading roletype="platform" role={r.platformRoles} userid={r.userId} reloadfunction={reload} />
        )}
      />
      <Table.Column<User>
        dataIndex="tenantRoles"
        title="租户角色"
        width={200}
        render={(_, r) => (
          <SelectWithLoading roletype="tenant" role={r.tenantRoles} userid={r.userId} reloadfunction={reload} />
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

const AccountTable: React.FC<DataTableProps<Account>> = ({ data, loading, reload }) => {
  return (
    <Table
      loading={loading}
      dataSource={data}
      scroll={{ x: true }}
      pagination={{ showSizeChanger: true }}
      rowKey="accountName"
      bordered
      title={() => <Title><span>账户</span><a onClick={reload}>刷新</a></Title>}
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
      <div>
        <p>
          您可以在这里管理当前系统中默认租户下的用户和账户，以及设置某个用户为<strong>初始管理员</strong>。
        </p>
        <p>
          <strong>初始管理员</strong>指同时为租户管理员和平台管理员的用户。
        </p>
        <UserTable data={usersData} loading={usersLoading} reload={usersReload} />
        <AccountTable data={accountsData} loading={accountsLoading} reload={accountsReload} />
      </div>
    </Centered>
  );

};
