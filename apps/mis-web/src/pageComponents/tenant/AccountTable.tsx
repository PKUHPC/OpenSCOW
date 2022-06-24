import { Button, Divider, Form, Input, Select, Space, Table, Tag } from "antd";
import Link from "next/link";
import React, { useMemo, useState } from "react";
import { FilterFormContainer } from "src/components/FilterFormContainer";
import { Money } from "src/generated/common/money";
import type { Account } from "src/generated/server/account";
import type { GetAccountsSchema } from "src/pages/api/tenant/getAccounts";
import { moneyToString } from "src/utils/money";

interface Props {
  data: GetAccountsSchema["responses"]["200"] | undefined;
  isLoading: boolean;
  reload: () => void;
}

interface FilterForm {
  accountName: string | undefined;
  blocked: "blocked" | "unblocked" | "unlimited";

}

export const AccountTable: React.FC<Props> = ({
  data, isLoading,
}) => {

  const [form] = Form.useForm<FilterForm>();

  const [query, setQuery] = useState<FilterForm>({
    accountName: undefined,
    blocked: "unlimited",
  });

  const filteredData = useMemo(() => data ? data.results.filter((x) => (
    (!query.accountName || x.accountName.includes(query.accountName)) &&
     (query.blocked === "unlimited" || (query.blocked === "blocked" ? x.blocked : !x.blocked))
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
          <Form.Item label="账户" name="accountName">
            <Input />
          </Form.Item>
          <Form.Item label="是否被封锁" name="blocked">
            <Select>
              <Select.Option value="unlimited">所有</Select.Option>
              <Select.Option value="unblocked">未封锁</Select.Option>
              <Select.Option value="blocked">封锁</Select.Option>
            </Select>
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
        rowKey="userId"
        scroll={{ x: true }}
      >
        <Table.Column<Account> dataIndex="accountName" title="账户名"
          sorter={(a, b) => a.accountName.localeCompare(b.accountName)}
          sortDirections={["ascend", "descend"]}
        />
        <Table.Column<Account> dataIndex="ownerName" title="拥有者"
          render={(_, r) => `${r.ownerName}（${r.ownerId}）`}
        />
        <Table.Column<Account> dataIndex="comment" title="备注" />
        <Table.Column<Account> dataIndex="balance" title="余额"
          render={(b: Money) => moneyToString(b) + " 元" }
        />
        <Table.Column<Account> dataIndex="blocked" title="状态"
          render={(blocked) => blocked ? <Tag color="red">封锁</Tag> : <Tag color="green">正常</Tag>}
        />
        <Table.Column<Account> title="操作"
          render={(_, r) => (
            <Space split={<Divider type="vertical" />}>
              <Link href={{ pathname: `/admin/accounts/${r.accountName}/users` }}>
              管理成员
              </Link>
            </Space>
          )}
        />
      </Table>
    </div>
  );
};
