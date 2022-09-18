import { message, Popconfirm, Space, Table, Tag } from "antd";
import { useEffect } from "react";
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
      <Table.Column<User> dataIndex="platformRoles" title="平台角色"
        render={(r: PlatformRole[]) => r.map((x) => <Tag key={x}>{PlatformRoleTexts[x]}</Tag>)}
      />
      <Table.Column<User> dataIndex="tenantRoles" title="租户角色"
        render={(r: TenantRole[]) => r.map(((x) => <Tag key={x}>{TenantRoleTexts[x]}</Tag>))}
      />
      <Table.Column<User> dataIndex="accountAffiliations" title="所属账户"
        render={(accounts: AccountAffiliation[]) => accounts
          .map((x) =>
            x.accountName +
              (x.role !== UserRole.USER ? `(${UserRoleTexts[x.role]})` : ""),
          ).join(", ")}
      />
      <Table.Column<User> title="初始管理员" render={(_, r) => (
        <Space>
          {
            !(r.platformRoles.includes(PlatformRole.PLATFORM_ADMIN) && r.tenantRoles.includes(TenantRole.TENANT_ADMIN))
              ? (
                <Popconfirm
                  title="确定要赋予此用户的平台管理员和租户管理员角色吗？"
                  onConfirm={async () => {
                    await api.setAsInitAdmin({ body: { userId: r.userId } }).then(() => {
                      message.success("设置成功！");
                      reload();
                    });
                  }}
                >
                  <a>设置</a>
                </Popconfirm>
              ) : undefined
          }
          {
            (r.platformRoles.includes(PlatformRole.PLATFORM_ADMIN) || r.tenantRoles.includes(TenantRole.TENANT_ADMIN))
              ? (
                <Popconfirm
                  title="确定要取消此用户的平台管理员和租户管理员角色吗？"
                  onConfirm={async () => {
                    await api.unsetInitAdmin({ body: { userId: r.userId } }).then(() => {
                      message.success("取消设置成功！");
                      reload();
                    });
                  }}
                >
                  <a>取消</a>
                </Popconfirm>
              ) : undefined
          }
        </Space>
      )}
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
      <Table.Column<Account> dataIndex="ownerName" title="拥有者"
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
