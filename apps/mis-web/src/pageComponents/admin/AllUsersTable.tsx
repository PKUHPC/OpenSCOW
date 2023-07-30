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

import { formatDateTime } from "@scow/lib-web/build/utils/datetime";
import { PlatformUserInfo } from "@scow/protos/build/server/user";
import { Static } from "@sinclair/typebox";
import { App, Button, Divider, Form, Input, Space, Table } from "antd";
import React, { useCallback, useState } from "react";
import { useAsync } from "react-async";
import { api } from "src/apis";
import { ChangePasswordModalLink } from "src/components/ChangePasswordModal";
import { FilterFormContainer, FilterFormTabs } from "src/components/FilterFormContainer";
import { PlatformRoleSelector } from "src/components/PlatformRoleSelector";
import { PlatformRole, SortDirectionType, UsersSortFieldType } from "src/models/User";
import { GetAllUsersSchema } from "src/pages/api/admin/getAllUsers";
import { User } from "src/stores/UserStore";

interface FilterForm {
  idOrName: string | undefined;
}

interface PageInfo {
    page: number;
    pageSize?: number;
}

interface SortInfo {
  sortField?: UsersSortFieldType;
  sortOrder?: SortDirectionType;
};

interface Props {
  refreshToken: boolean;
  user: User;
}

const filteredRoles = {
  "ALL_USERS": "所有用户",
  "PLATFORM_ADMIN": "平台管理员",
  "PLATFORM_FINANCE": "财务人员",
};
type FilteredRole = keyof typeof filteredRoles;

export const AllUsersTable: React.FC<Props> = ({ refreshToken, user }) => {

  const [ query, setQuery ] = useState<FilterForm>(() => {
    return { idOrName: undefined };
  });

  const [form] = Form.useForm<FilterForm>();

  const [pageInfo, setPageInfo] = useState<PageInfo>({ page: 1, pageSize: 10 });
  const [sortInfo, setSortInfo] = useState<SortInfo>({ sortField: undefined, sortOrder: undefined });
  const [currentPlatformRole, setCurrentPlatformRole] = useState<PlatformRole | undefined>(undefined);

  const promiseFn = useCallback(async () => {

    return await api.getAllUsers({ query: {
      page: pageInfo.page,
      pageSize: pageInfo.pageSize,
      sortField: sortInfo.sortField,
      sortOrder: sortInfo.sortOrder,
      idOrName: query.idOrName,
      platformRole: currentPlatformRole,
    } });
  }, [query, pageInfo, sortInfo, currentPlatformRole]);
  const { data, isLoading, reload: reloadAllUsers } = useAsync({ promiseFn, watch: refreshToken });

  const { data: platformUsersCounts, isLoading: isCountLoading, reload: reloadUsersCounts } = useAsync({
    promiseFn: useCallback(async () => await api.getPlatformUsersCounts({}), [refreshToken]),
  });

  const roleChangedHandlers = {
    "ALL_USERS": {
      setCurrentPlatformRole: () => setCurrentPlatformRole(undefined),
      getCount: () => platformUsersCounts?.totalCount ?? 0,
    },
    "PLATFORM_ADMIN": {
      setCurrentPlatformRole: () => setCurrentPlatformRole(PlatformRole.PLATFORM_ADMIN),
      getCount: () => platformUsersCounts?.totalAdminCount ?? 0,
    },
    "PLATFORM_FINANCE": {
      setCurrentPlatformRole: () => setCurrentPlatformRole(PlatformRole.PLATFORM_FINANCE),
      getCount: () => platformUsersCounts?.totalFinanceCount ?? 0,
    },
  };

  const getUsersRoleCount = (role: FilteredRole): number => {
    return roleChangedHandlers[role].getCount();
  };

  const handleFilterRoleChange = (role: FilteredRole) => {
    roleChangedHandlers[role].setCurrentPlatformRole();
    setPageInfo({ page: 1, pageSize: pageInfo.pageSize });
    setSortInfo({ sortField: undefined, sortOrder: undefined });
  };

  const reload = () => {
    reloadAllUsers();
    reloadUsersCounts();
  };

  return (
    <div>
      <FilterFormContainer style={{ display: "flex", justifyContent: "space-between" }}>
        <Form<FilterForm>
          layout="inline"
          form={form}
          initialValues={query}
          onFinish={async () => {
            const { idOrName } = await form.validateFields();
            setQuery({ idOrName: idOrName === "" ? undefined : idOrName });
            setPageInfo({ page: 1, pageSize: pageInfo.pageSize });
            setSortInfo({ sortField: undefined, sortOrder: undefined });
          }}
        >
          <Form.Item label="用户ID或者姓名" name="idOrName">
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">搜索</Button>
          </Form.Item>
        </Form>
        <Space style={{ marginBottom: "-16px" }}>
          <FilterFormTabs
            tabs={Object.keys(filteredRoles).map((role) => ({
              title: `${filteredRoles[role]}(${getUsersRoleCount(role as FilteredRole)})`,
              key: role,
            }))}
            onChange={(value) => handleFilterRoleChange(value as FilteredRole)}
          />
        </Space>

      </FilterFormContainer>
      <UserInfoTable
        data={data}
        pageInfo={pageInfo}
        setPageInfo={setPageInfo}
        sortInfo={sortInfo}
        setSortInfo={setSortInfo}
        isLoading={isLoading && isCountLoading}
        reload={reload}
        user={user}
      />
    </div>
  );
};

interface UserInfoTableProps {
  data: Static<typeof GetAllUsersSchema["responses"]["200"]> | undefined;
  pageInfo: PageInfo;
  setPageInfo?: (info: PageInfo) => void;
  sortInfo: SortInfo;
  setSortInfo?: (info: SortInfo) => void;
  isLoading: boolean;
  reload: () => void;
  user: User;
}

const UserInfoTable: React.FC<UserInfoTableProps> = ({
  data, pageInfo, setPageInfo, sortInfo, setSortInfo, isLoading, reload, user,
}) => {

  const { message } = App.useApp();

  const handleTableChange = (_, __, sorter) => {
    if (setSortInfo) {
      setSortInfo({
        sortField: sorter.field,
        sortOrder: sorter.order,
      });
    }
  };

  return (
    <>
      <Table
        dataSource={data?.platformUsers}
        loading={isLoading}
        pagination={setPageInfo ? {
          current: pageInfo.page,
          defaultPageSize: 10,
          pageSize: pageInfo.pageSize,
          showSizeChanger: true,
          total: data?.totalCount,
          onChange: (page, pageSize) => setPageInfo({ page, pageSize }),
        } : false}
        scroll={{ x: true }}
        onChange={handleTableChange}
      >
        <Table.Column<PlatformUserInfo>
          dataIndex="userId"
          title="用户ID"
          sorter={true}
          sortDirections={["ascend", "descend"]}
          sortOrder={sortInfo.sortField === "userId" ? sortInfo.sortOrder : null}
        />
        <Table.Column<PlatformUserInfo>
          dataIndex="name"
          title="姓名"
          sorter={true}
          sortDirections={["ascend", "descend"]}
          sortOrder={sortInfo.sortField === "name" ? sortInfo.sortOrder : null}
        />
        <Table.Column<PlatformUserInfo> dataIndex="tenantName" title="所属租户" />
        <Table.Column<PlatformUserInfo>
          dataIndex="availableAccounts"
          title="可用账户"
          render={(accounts) => accounts.join(",")}
        />
        <Table.Column<PlatformUserInfo>
          dataIndex="createTime"
          title="创建时间"
          sorter={true}
          sortDirections={["ascend", "descend"]}
          sortOrder={sortInfo.sortField === "createTime" ? sortInfo.sortOrder : null}
          render={(time: string) => formatDateTime(time)}
        />
        <Table.Column<PlatformUserInfo>
          dataIndex="roles"
          title="平台角色"
          render={(_, r) => (
            <PlatformRoleSelector reload={reload} roles={r.platformRoles} userId={r.userId} currentUser={user} />
          )}
        />

        <Table.Column<PlatformUserInfo>
          dataIndex="changePassword"
          title="操作"
          render={(_, r) => (
            <Space split={<Divider type="vertical" />}>
              <ChangePasswordModalLink
                userId={r.userId}
                name={r.name}
                onComplete={async (newPassword) => {
                  await api.changePasswordAsPlatformAdmin({ body:{
                    identityId: r.userId,
                    newPassword: newPassword,
                  } })
                    .httpError(404, () => { message.error("用户不存在"); })
                    .httpError(501, () => { message.error("本功能在当前配置下不可用"); })
                    .then(() => { message.success("修改成功"); })
                    .catch(() => { message.error("修改失败"); });
                }}
              >
                修改密码
              </ChangePasswordModalLink>
            </Space>
          )}
        />
      </Table>
    </>
  );

};
