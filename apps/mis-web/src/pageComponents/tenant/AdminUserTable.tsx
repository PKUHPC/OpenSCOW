import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Button, Divider, Form, Input, message, Modal, Space, Table } from "antd";
import React, { useMemo, useState } from "react";
import { api } from "src/apis";
import { ChangePasswordModalLink } from "src/components/ChangePasswordModal";
import { DisabledA } from "src/components/DisabledA";
import { FilterFormContainer } from "src/components/FilterFormContainer";
import { PlatformUserInfo } from "src/generated/server/user";
import { FullUserInfo, TenantRole } from "src/models/User";
import { GetTenantUsersSchema } from "src/pages/api/admin/getTenantUsers";
import { User } from "src/stores/UserStore";
import { compareDateTime, formatDateTime } from "src/utils/datetime";

interface Props {
  data: GetTenantUsersSchema["responses"]["200"] | undefined;
  isLoading: boolean;
  reload: () => void;
  user: User;
}

interface FilterForm {
  idOrName: string | undefined;
}


export const AdminUserTable: React.FC<Props> = ({
  data, isLoading, reload, user,
}) => {

  const [form] = Form.useForm<FilterForm>();

  const [query, setQuery] = useState<FilterForm>({
    idOrName: undefined,
  });

  const filteredData = useMemo(() => data ? data.results.filter((x) => (
    (!query.idOrName || x.id.includes(query.idOrName) || x.name.includes(query.idOrName))
  )) : undefined, [data, query]);

  return (
    <div>
      <FilterFormContainer>
        <Form<FilterForm>
          layout="inline"
          form={form}
          initialValues={query}
          onFinish={async () => {
            setQuery(await form.validateFields());
          }}
        >
          <Form.Item label="用户ID或者姓名" name="idOrName">
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">搜索</Button>
          </Form.Item>
        </Form>
      </FilterFormContainer>

      <Table
        dataSource={filteredData}
        loading={isLoading}
        pagination={{ showSizeChanger: true }}
        rowKey="id"
        scroll={{ x: true }}
      >
        <Table.Column<FullUserInfo>
          dataIndex="id"
          title="用户ID"
          sorter={(a, b) => a.id.localeCompare(b.id)}
          sortDirections={["ascend", "descend"]}
        />
        <Table.Column<FullUserInfo>
          dataIndex="name"
          title="姓名"
          sorter={(a, b) => a.name.localeCompare(b.name)}
          sortDirections={["ascend", "descend"]}
        />
        <Table.Column<FullUserInfo>
          dataIndex="email"
          title="邮箱"
          sorter={(a, b) => a.email.localeCompare(b.email)}
          sortDirections={["ascend", "descend"]}
        />
        <Table.Column<FullUserInfo>
          dataIndex="tenantRoles"
          title="租户管理员"
          render={(_, r) => (
            r.tenantRoles.includes(TenantRole.TENANT_ADMIN) ? (
              <Space size="middle">
                是
                <DisabledA
                  disabled={r.id === user.identityId}
                  message="不能取消自己的租户管理员权限"
                  onClick={async () => {
                    Modal.confirm({
                      title: "确定取消租户管理员权限",
                      icon: <ExclamationCircleOutlined />,
                      content: `确定要移除用户${r.name}（ID: ${r.id}）的租户管理员权限？`,
                      onOk: async () => {
                        await api.unsetTenantRole({ body: {
                          userId : r.id,
                          roleType: TenantRole.TENANT_ADMIN,
                        } })
                          .then(() => {
                            message.success("操作成功！");
                            reload();
                          });
                      },
                    });
                  }}
                >
                  取消
                </DisabledA>
              </Space>
            ) : (
              <Space size="middle">
                否
                <a
                  onClick={() => {
                    Modal.confirm({
                      title: "确定设置为租户管理员",
                      icon: <ExclamationCircleOutlined />,
                      content: `确定要设置用户${r.name}（ID: ${r.id}）为租户管理员？`,
                      onOk: async () => {
                        await api.setTenantRole({ body: {
                          userId : r.id,
                          roleType: TenantRole.TENANT_ADMIN,
                        } })
                          .then(() => {
                            message.success("操作成功！");
                            reload();
                          });
                      },
                    });
                  }}
                >
                  设置
                </a>
              </Space>
            )
          )}
        />
        <Table.Column<FullUserInfo>
          dataIndex="tenantRoles"
          title="租户财务人员"
          render={(_, r) => (
            r.tenantRoles.includes(TenantRole.TENANT_FINANCE) ? (
              <Space size="middle">
                是
                <a
                  onClick={() => {
                    Modal.confirm({
                      title: "确定取消租户财务人员权限",
                      icon: <ExclamationCircleOutlined />,
                      content: `确定要移除用户${r.name}（ID: ${r.id}）的财务人员权限？`,
                      onOk: async () => {
                        await api.unsetTenantRole({ body: {
                          userId : r.id,
                          roleType: TenantRole.TENANT_FINANCE,
                        } })
                          .then(() => {
                            message.success("操作成功！");
                            reload();
                          });
                      },
                    });
                  }}
                >
                  取消
                </a>
              </Space>
            ) : (
              <Space size="middle">
                否
                <a
                  onClick={() => {
                    Modal.confirm({
                      title: "确定设置为租户财务人员",
                      icon: <ExclamationCircleOutlined />,
                      content: `确定要设置用户${r.name}（ID: ${r.id}）为租户财务人员？`,
                      onOk: async () => {
                        await api.setTenantRole({ body: {
                          userId : r.id,
                          roleType: TenantRole.TENANT_FINANCE,
                        } })
                          .then(() => {
                            message.success("操作成功！");
                            reload();
                          });
                      },
                    });
                  }}
                >
                  设置
                </a>
              </Space>
            )
          )}
        />
        <Table.Column<FullUserInfo>
          dataIndex="createTime"
          title="创建时间"
          sorter={(a, b) => compareDateTime(a.createTime, b.createTime)}
          sortDirections={["ascend", "descend"]}
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
                onComplete={async (oldPassword, newPassword) => {
                  await api.changePasswordAsTenantAdmin({ body:{
                    identityId: r.id,
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
    </div>
  );
};
