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
import { Static } from "@sinclair/typebox";
import { App, Button, Divider, Form, Input, Space, Table } from "antd";
import { SortOrder } from "antd/es/table/interface";
import React, { useMemo, useState } from "react";
import { api } from "src/apis";
import { ChangePasswordModalLink } from "src/components/ChangePasswordModal";
import { FilterFormContainer, FilterFormTabs } from "src/components/FilterFormContainer";
import { TenantRoleSelector } from "src/components/TenantRoleSelector";
import { FullUserInfo, TenantRole } from "src/models/User";
import { GetTenantUsersSchema } from "src/pages/api/admin/getTenantUsers";
import { User } from "src/stores/UserStore";

interface Props {
  data: Static<typeof GetTenantUsersSchema["responses"]["200"]> | undefined;
  isLoading: boolean;
  reload: () => void;
  user: User;
}

interface FilterForm {
  idOrName: string | undefined;
}

const filteredRoles = {
  "ALL_USERS": "所有用户",
  "TENANT_ADMIN": "租户管理员",
  "TENANT_FINANCE": "财务人员",
};
type FilteredRole = keyof typeof filteredRoles;

export const AdminUserTable: React.FC<Props> = ({
  data, isLoading, reload, user,
}) => {

  const { message } = App.useApp();
  const [form] = Form.useForm<FilterForm>();

  const [query, setQuery] = useState<FilterForm>({
    idOrName: undefined,
  });

  const [rangeSearchRole, setRangeSearchRole] = useState<FilteredRole>("ALL_USERS");
  const [currentPageNum, setCurrentPageNum] = useState<number>(1);
  const [currentSortInfo, setCurrentSortInfo] =
    useState<{ field: string | null | undefined, order: SortOrder }>({ field: null, order: null });

  const filteredData = useMemo(() => data ? data.results.filter((x) => (
    (!query.idOrName || x.id.includes(query.idOrName) || x.name.includes(query.idOrName))
      && (rangeSearchRole === "ALL_USERS" || x.tenantRoles.includes(
        rangeSearchRole === "TENANT_ADMIN" ? TenantRole.TENANT_ADMIN : TenantRole.TENANT_FINANCE))
  )) : undefined, [data, query, rangeSearchRole]);

  const getUsersRoleCount = (role: FilteredRole): number => {

    switch (role) {
    case "TENANT_ADMIN":
      return data ? data.results.filter((user) => user.tenantRoles.includes(TenantRole.TENANT_ADMIN)).length : 0;
    case "TENANT_FINANCE":
      return data ? data.results.filter((user) => user.tenantRoles.includes(TenantRole.TENANT_FINANCE)).length : 0;
    case "ALL_USERS":
    default:
      return data ? data.results.length : 0;
    }
  };

  const handleTableChange = (_, __, sortInfo) => {
    setCurrentSortInfo({ field: sortInfo.field, order: sortInfo.order });
  };

  // 切换用户角色时重置页码到首页，重置排序信息
  const handleFilterRoleChange = (role: FilteredRole) => {
    setRangeSearchRole(role);
    setCurrentPageNum(1);
    setCurrentSortInfo({ field: null, order: null });
  };

  return (
    <div>
      <FilterFormContainer style={{ display: "flex", justifyContent: "space-between" }}>
        <Form<FilterForm>
          layout="inline"
          form={form}
          initialValues={query}
          // 搜索结束时重置页码到首页，重置排序信息
          onFinish={async () => {
            setQuery(await form.validateFields());
            setCurrentPageNum(1);
            setCurrentSortInfo({ field: null, order: null });
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

      <Table
        dataSource={filteredData}
        loading={isLoading}
        pagination={{
          showSizeChanger: true,
          current: currentPageNum,
          onChange: (page) => setCurrentPageNum(page),
        }}
        rowKey="id"
        scroll={{ x: true }}
        onChange={handleTableChange}
      >
        <Table.Column<FullUserInfo>
          dataIndex="id"
          title="用户ID"
          sorter={(a, b) => a.id.localeCompare(b.id)}
          sortDirections={["ascend", "descend"]}
          sortOrder={currentSortInfo.field === "id" ? currentSortInfo.order : null}
        />
        <Table.Column<FullUserInfo>
          dataIndex="name"
          title="姓名"
          sorter={(a, b) => a.name.localeCompare(b.name)}
          sortDirections={["ascend", "descend"]}
          sortOrder={currentSortInfo.field === "name" ? currentSortInfo.order : null}
        />
        <Table.Column<FullUserInfo>
          dataIndex="email"
          title="邮箱"
          sorter={(a, b) => a.email.localeCompare(b.email)}
          sortDirections={["ascend", "descend"]}
          sortOrder={currentSortInfo.field === "email" ? currentSortInfo.order : null}
        />
        <Table.Column<FullUserInfo>
          dataIndex="tenantRoles"
          title="租户角色"
          render={(_, r) => (
            <TenantRoleSelector reload={reload} roles={r.tenantRoles} userId={r.id} currentUser={user} />
          )}
        />
        <Table.Column<FullUserInfo>
          dataIndex="createTime"
          title="创建时间"
          sorter={(a, b) => compareDateTime(a.createTime, b.createTime)}
          sortDirections={["ascend", "descend"]}
          sortOrder={currentSortInfo.field === "createTime" ? currentSortInfo.order : null}
          render={(d) => formatDateTime(d)}
        />
        <Table.Column<FullUserInfo>
          dataIndex="affiliatedAccountNames"
          title="可用账户"
          render={(_, r) => r.accountAffiliations.map((x) => x.accountName).join(", ")}
        />
        <Table.Column<FullUserInfo>
          dataIndex="changePassword"
          title="操作"
          render={(_, r) => (
            <Space split={<Divider type="vertical" />}>
              <ChangePasswordModalLink
                userId={r.id}
                name={r.name}
                onComplete={async (newPassword) => {
                  await api.changePasswordAsTenantAdmin({ body:{
                    identityId: r.id,
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
    </div>
  );
};
