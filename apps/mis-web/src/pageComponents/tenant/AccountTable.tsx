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

import { moneyToNumber } from "@scow/lib-decimal";
import { Money } from "@scow/protos/build/common/money";
import { Static } from "@sinclair/typebox";
import { Button, Divider, Form, Input, Space, Table, Tag } from "antd";
import { SortOrder } from "antd/es/table/interface";
import Link from "next/link";
import React, { useMemo, useState } from "react";
import { FilterFormContainer, FilterFormTabs } from "src/components/FilterFormContainer";
import type { AdminAccountInfo, GetAccountsSchema } from "src/pages/api/tenant/getAccounts";
import { moneyToString } from "src/utils/money";

interface Props {
  data: Static<typeof GetAccountsSchema["responses"]["200"]> | undefined;
  isLoading: boolean;
  reload: () => void;
}

interface FilterForm {
  accountName: string | undefined;
}

const filteredStatuses = {
  "ALL": "所有账户",
  "DEBT": "欠费账户",
  "BLOCKED": "封锁账户",
};
type FilteredStatus = keyof typeof filteredStatuses;

export const AccountTable: React.FC<Props> = ({
  data, isLoading,
}) => {

  const [form] = Form.useForm<FilterForm>();

  const [rangeSearchStatus, setRangeSearchStatus] = useState<FilteredStatus>("ALL");
  const [currentPageNum, setCurrentPageNum] = useState<number>(1);
  const [currentSortInfo, setCurrentSortInfo] =
    useState<{ field: string | null | undefined, order: SortOrder }>({ field: null, order: null });

  const [query, setQuery] = useState<FilterForm>({
    accountName: undefined,
  });

  const filteredData = useMemo(() => data ? data.results.filter((x) => (
    (!query.accountName || x.accountName.includes(query.accountName))
      && (rangeSearchStatus === "ALL" || (rangeSearchStatus === "BLOCKED" ? x.blocked : !x.balance.positive))
  )) : undefined, [data, query, rangeSearchStatus]);

  const usersStatusCount = useMemo(() => {
    if (!data || !data.results) return { BLOCKED : 0, DEBT : 0, ALL : 0 };
    const counts = {
      BLOCKED: data.results.filter((user) => user.blocked).length,
      DEBT: data.results.filter((user) => !user.balance.positive).length,
      ALL: data.results.length,
    };
    return counts;
  }, [data]);

  const handleTableChange = (_, __, sortInfo) => {
    setCurrentSortInfo({ field: sortInfo.field, order: sortInfo.order });
  };

  const handleFilterStatusChange = (status: FilteredStatus) => {
    setRangeSearchStatus(status);
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
          onFinish={async () => {
            setQuery(await form.validateFields());
            setCurrentPageNum(1);
            setCurrentSortInfo({ field: null, order: null });
          }}
        >
          <Form.Item label="账户" name="accountName">
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">搜索</Button>
          </Form.Item>
        </Form>
        <Space style={{ marginBottom: "-16px" }}>
          <FilterFormTabs
            tabs={Object.keys(filteredStatuses).map((status) => ({
              title: `${filteredStatuses[status]}(${usersStatusCount[status as FilteredStatus]})`,
              key: status,
            }))}
            onChange={(value) => handleFilterStatusChange(value as FilteredStatus)}
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
        rowKey="userId"
        scroll={{ x: true }}
        onChange={handleTableChange}
      >
        <Table.Column<AdminAccountInfo>
          dataIndex="accountName"
          title="账户名"
          sorter={(a, b) => a.accountName.localeCompare(b.accountName)}
          sortDirections={["ascend", "descend"]}
          sortOrder={currentSortInfo.field === "accountName" ? currentSortInfo.order : null}
        />
        <Table.Column<AdminAccountInfo>
          dataIndex="ownerName"
          title="拥有者"
          render={(_, r) => `${r.ownerName}（${r.ownerId}）`}
        />
        <Table.Column<AdminAccountInfo>
          dataIndex="userCount"
          title="用户数量"
        />
        <Table.Column<AdminAccountInfo>
          dataIndex="comment"
          title="备注"
        />
        <Table.Column<AdminAccountInfo>
          dataIndex="balance"
          title="余额"
          sorter={(a, b) => (moneyToNumber(a.balance)) - (moneyToNumber(b.balance))}
          sortDirections={["ascend", "descend"]}
          sortOrder={currentSortInfo.field === "balance" ? currentSortInfo.order : null}
          render={(b: Money) => moneyToString(b) + " 元" }
        />
        <Table.Column<AdminAccountInfo>
          dataIndex="blocked"
          title="状态"
          sorter={(a, b) => (a.blocked ? 1 : 0) - (b.blocked ? 1 : 0)}
          sortDirections={["ascend", "descend"]}
          sortOrder={currentSortInfo.field === "blocked" ? currentSortInfo.order : null}
          render={(blocked) => blocked ? <Tag color="red">封锁</Tag> : <Tag color="green">正常</Tag>}
        />
        <Table.Column<AdminAccountInfo>
          title="操作"
          render={(_, r) => (
            <Space split={<Divider type="vertical" />}>
              <Link href={{ pathname: `/tenant/accounts/${r.accountName}/users` }}>
              管理成员
              </Link>
            </Space>
          )}
        />
      </Table>
    </div>
  );
};
