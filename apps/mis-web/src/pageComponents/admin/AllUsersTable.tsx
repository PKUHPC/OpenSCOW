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
import { App, Divider, Space, Table } from "antd";
import React, { useCallback, useState } from "react";
import { useAsync } from "react-async";
import { api } from "src/apis";
import { ChangePasswordModalLink } from "src/components/ChangePasswordModal";
import { PlatformRoleSelector } from "src/components/PlatformRoleSelector";
import { GetAllUsersSchema } from "src/pages/api/admin/getAllUsers";
import { User } from "src/stores/UserStore";


interface PageInfo {
    page: number;
    pageSize?: number;
}

interface Props {
  refreshToken: boolean;
  user: User;
}


export const AllUsersTable: React.FC<Props> = ({ refreshToken, user }) => {

  const [pageInfo, setPageInfo] = useState<PageInfo>({ page: 1, pageSize: 10 });

  const promiseFn = useCallback(async () => {
    return await api.getAllUsers({ query: {
      page: pageInfo.page,
      pageSize: pageInfo.pageSize,
    } });
  }, [pageInfo]);
  const { data, isLoading, reload } = useAsync({ promiseFn, watch: refreshToken });

  return (
    <div>
      <UserInfoTable
        data={data}
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
  data: GetAllUsersSchema["responses"]["200"] | undefined;
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
        <Table.Column<PlatformUserInfo> dataIndex="userId" title="用户ID" />
        <Table.Column<PlatformUserInfo> dataIndex="name" title="姓名" />
        <Table.Column<PlatformUserInfo>
          dataIndex="createTime"
          title="创建时间"
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
