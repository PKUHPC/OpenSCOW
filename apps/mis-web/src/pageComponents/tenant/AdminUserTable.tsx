import { Button, Form, Input, Table, Tag } from "antd";
import React, { useMemo, useState } from "react";
import { FilterFormContainer } from "src/components/FilterFormContainer";
import { FullUserInfo, TenantRoleTexts } from "src/models/User";
import { GetTenantUsersSchema } from "src/pages/api/admin/getTenantUsers";
import { compareDateTime, formatDateTime } from "src/utils/datetime";

interface Props {
  data: GetTenantUsersSchema["responses"]["200"] | undefined;
  isLoading: boolean;
  reload: () => void;
}

interface FilterForm {
  idOrName: string | undefined;
}

export const AdminUserTable: React.FC<Props> = ({
  data, isLoading,
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
          title="租户角色"
          render={(_, r) => r.tenantRoles.map((x) => <Tag key={x}>{TenantRoleTexts[x]}</Tag>)}
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
      </Table>
    </div>
  );
};
