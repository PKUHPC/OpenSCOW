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
import { GetAllUsersResponse, PlatformUserInfo } from "@scow/protos/build/server/user";
import { Static } from "@sinclair/typebox";
import { App, Button, Divider, Form, Input, Space, Table } from "antd";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useAsync } from "react-async";
import { api } from "src/apis";
import { ChangePasswordModalLink } from "src/components/ChangePasswordModal";
import { FilterFormContainer, FilterFormTabs } from "src/components/FilterFormContainer";
import { PlatformRoleSelector } from "src/components/PlatformRoleSelector";
import { PlatformRole } from "src/models/User";
import { GetAllUsersSchema } from "src/pages/api/admin/getAllUsers";
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

const filterUsersByPlatformRole = (dataToFilter: PlatformUserInfo[] | undefined, role: PlatformRole) => {
  return dataToFilter ? dataToFilter.filter((user) => user.platformRoles.includes(role)) : [];
};

export const AllUsersTable: React.FC<Props> = ({ refreshToken, user }) => {

  const [ query, setQuery ] = useState<FilterForm>(() => {
    return { idOrName: undefined };
  });

  const [form] = Form.useForm<FilterForm>();

  const [pageInfo, setPageInfo] = useState<PageInfo>({ page: 1, pageSize: 10 });

  const [rangeSearchRole, setRangeSearchRole] = useState<string>("ALL_USERS");
  const [dataFetched, setDataFetched] = useState<boolean>(false);

  const promiseFn = useCallback(async () => {
    return await api.getAllUsers({ query: {
      page: pageInfo.page,
      pageSize: pageInfo.pageSize,
      idOrName: query.idOrName,
    } });
  }, [query, pageInfo]);
  const { data, isLoading, reload } = useAsync({ promiseFn, watch: refreshToken });

  const initialDataRef = useRef<GetAllUsersResponse | undefined>(undefined);
  useEffect(() => {
    if (data && !initialDataRef.current) {
      initialDataRef.current = data;
      setDataFetched(true);
    }
  }, [data]);

  const initialPlatformUsers = initialDataRef.current?.platformUsers;

  // 保存各角色所有用户数
  const allUsersCounts = dataFetched ? initialDataRef.current?.totalCount : 0;
  const platformAdminCounts = dataFetched && initialDataRef.current?.platformUsers ?
    filterUsersByPlatformRole(initialPlatformUsers, PlatformRole.PLATFORM_ADMIN).length : 0;
  const platformFinanceCounts = dataFetched && initialDataRef.current?.platformUsers ?
    filterUsersByPlatformRole(initialPlatformUsers, PlatformRole.PLATFORM_FINANCE).length : 0;

  const setFilteredData = (rangeSearchRole) => {
    if (data) {
      switch (rangeSearchRole) {
      case "ALL_USERS":
        return data;
      case "PLATFORM_ADMIN":
        return {
          totalCount: platformAdminCounts ?? 0,
          platformUsers: filterUsersByPlatformRole(data?.platformUsers, PlatformRole.PLATFORM_ADMIN),
        };
      case "PLATFORM_FINANCE":
        return {
          totalCount: platformFinanceCounts ?? 0,
          platformUsers: filterUsersByPlatformRole(data?.platformUsers, PlatformRole.PLATFORM_FINANCE),
        };
      default:
        return data;
      }
    }
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
              { title: `所有用户(${allUsersCounts})`, key: "All_USERS" },
              { title: `平台管理员(${platformAdminCounts})`, key: "PLATFORM_ADMIN" },
              { title: `财务人员(${platformFinanceCounts})`, key: "PLATFORM_FINANCE" },
            ]}
            onChange={(value) => setRangeSearchRole(value)}
          />
        </Space>

      </FilterFormContainer>
      <UserInfoTable
        data={rangeSearchRole ? setFilteredData(rangeSearchRole) : data}
        pageInfo={pageInfo}
        setPageInfo={setPageInfo}
        isLoading={isLoading}
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
  isLoading: boolean;
  reload: () => void;
  user: User;
}

const UserInfoTable: React.FC<UserInfoTableProps> = ({
  data, pageInfo, setPageInfo, isLoading, reload, user,
}) => {

  const { message } = App.useApp();

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
