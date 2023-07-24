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

import { compareDateTime, formatDateTime } from "@scow/lib-web/build/utils/datetime";
import { PlatformUserInfo } from "@scow/protos/build/server/user";
import { Static } from "@sinclair/typebox";
import { App, Button, Divider, Form, Input, Space, Table } from "antd";
import React, { useCallback, useState } from "react";
import { useAsync } from "react-async";
import { api } from "src/apis";
import { ChangePasswordModalLink } from "src/components/ChangePasswordModal";
import { FilterFormContainer, FilterFormTabs } from "src/components/FilterFormContainer";
import { PlatformRoleSelector } from "src/components/PlatformRoleSelector";
import { GetAllUsersSchema } from "src/pages/api/admin/getAllUsers";
import { GetPlatformRoleUsersSchema } from "src/pages/api/admin/getPlatformRoleUsers";
import { User } from "src/stores/UserStore";

interface FilterForm {
  idOrName: string | undefined;
}

interface PageInfo {
    page: number;
    pageSize?: number;
}

interface Props {
  refreshToken: boolean;
  user: User;
}

export const AllUsersTable: React.FC<Props> = ({ refreshToken, user }) => {

  const [ query, setQuery ] = useState<FilterForm>(() => {
    return { idOrName: undefined };
  });

  const [form] = Form.useForm<FilterForm>();

  const [pageInfo, setPageInfo] = useState<PageInfo>({ page: 1, pageSize: 10 });

  const promiseFn = useCallback(async () => {
    return await Promise.all([
      api.getAllUsers({ query: {
        page: pageInfo.page,
        pageSize: pageInfo.pageSize,
        idOrName: query.idOrName,
      } }),
      api.getPlatformRoleUsers({ query: {
        page: pageInfo.page,
        pageSize: pageInfo.pageSize,
        idOrName: query.idOrName,
      } }),
    ]);
  }, [query, pageInfo]);
  const { data, isLoading, reload } = useAsync({ promiseFn, watch: refreshToken });

  const [rangeSearchRole, setRangeSearchRole] = useState<string>("ALL_USERS");

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
            tabs={[
              { title: `所有用户(${data?.[1].totalCount ?? 0})`, key: "All_USERS" },
              { title: `平台管理员(${data?.[1].totalAdminCount ?? 0})`, key: "PLATFORM_ADMIN" },
              { title: `财务人员(${data?.[1].totalFinanceCount ?? 0})`, key: "PLATFORM_FINANCE" },
            ]}
            onChange={(value) => setRangeSearchRole(value)}
          />
        </Space>

      </FilterFormContainer>
      <UserInfoTable
        data={data}
        pageInfo={pageInfo}
        setPageInfo={setPageInfo}
        isLoading={isLoading}
        reload={reload}
        user={user}
        rangeSearchRole={rangeSearchRole}
      />
    </div>
  );
};

interface UserInfoTableProps {
  data: [ Static<typeof GetAllUsersSchema["responses"]["200"]>
    , Static<typeof GetPlatformRoleUsersSchema["responses"]["200"]>
  ] | undefined;
  pageInfo: PageInfo;
  setPageInfo?: (info: PageInfo) => void;
  isLoading: boolean;
  reload: () => void;
  user: User;
  rangeSearchRole: string;
}

const UserInfoTable: React.FC<UserInfoTableProps> = ({
  data, pageInfo, setPageInfo, isLoading, reload, user, rangeSearchRole,
}) => {

  const { message } = App.useApp();

  const { filteredData, totalCount } = (() => {
    switch (rangeSearchRole) {
    case "PLATFORM_ADMIN":
      return {
        filteredData: data?.[1].platformAdminUsers,
        totalCount: data?.[1].queryAdminCount,
      };
    case "PLATFORM_FINANCE":
      return {
        filteredData: data?.[1].platformFinanceUsers,
        totalCount: data?.[1].queryFinanceCount,
      };
    case "ALL_USERS":
    default:
      return {
        filteredData: data?.[0].platformUsers,
        totalCount: data?.[0].totalCount,
      };
    }
  })();

  return (
    <>
      <Table
        dataSource={filteredData}
        loading={isLoading}
        pagination={setPageInfo ? {
          current: pageInfo.page,
          defaultPageSize: 10,
          pageSize: pageInfo.pageSize,
          showSizeChanger: true,
          total: totalCount,
          onChange: (page, pageSize) => setPageInfo({ page, pageSize }),
        } : false}
        scroll={{ x: true }}
      >
        <Table.Column<PlatformUserInfo>
          dataIndex="userId"
          title="用户ID"
          sorter={(a, b) => a.userId.localeCompare(b.userId)}
          sortDirections={["ascend", "descend"]}
        />
        <Table.Column<PlatformUserInfo>
          dataIndex="name"
          title="姓名"
          sorter={(a, b) => a.name.localeCompare(b.name)}
          sortDirections={["ascend", "descend"]}
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
          sorter={(a, b) => compareDateTime(a.createTime ?? "", b.createTime ?? "")}
          sortDirections={["ascend", "descend"]}
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
                onComplete={async (oldPassword, newPassword) => {
                  await api.changePasswordAsPlatformAdmin({ body:{
                    identityId: r.userId,
                    oldPassword: oldPassword,
                    newPassword: newPassword,
                  } })
                    .httpError(404, () => { message.error("用户不存在"); })
                    .httpError(412, () => { message.error("原密码错误"); })
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
