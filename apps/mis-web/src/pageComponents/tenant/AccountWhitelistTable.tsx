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

import { ExclamationCircleOutlined } from "@ant-design/icons";
import { moneyToNumber } from "@scow/lib-decimal";
import { FilterFormContainer } from "@scow/lib-web/build/components/FilterFormContainer";
import { formatDateTime } from "@scow/lib-web/build/utils/datetime";
import { WhitelistedAccount } from "@scow/protos/build/server/account";
import { Static } from "@sinclair/typebox";
import { App, Button, Divider, Form, Input, Space, Table } from "antd";
import { SortOrder } from "antd/lib/table/interface";
import React, { useMemo, useState } from "react";
import { api } from "src/apis";
import { TableTitle } from "src/components/TableTitle";
import { Money } from "src/models/UserSchemaModel";
import type {
  GetWhitelistedAccountsSchema } from "src/pages/api/tenant/accountWhitelist/getWhitelistedAccounts";
import { moneyToString } from "src/utils/money";

interface Props {
  data: Static<typeof GetWhitelistedAccountsSchema["responses"]["200"]> | undefined;
  isLoading: boolean;
  reload: () => void;
}

interface FilterForm {
  accountName: string | undefined;
}

export const AccountWhitelistTable: React.FC<Props> = ({
  data, isLoading, reload,
}) => {

  const { message, modal } = App.useApp();

  const [form] = Form.useForm<FilterForm>();
  const [query, setQuery] = useState<FilterForm>({
    accountName: undefined,
  });
  const [currentPageNum, setCurrentPageNum] = useState<number>(1);
  const [currentSortInfo, setCurrentSortInfo] =
    useState<{ field: string | null | undefined, order: SortOrder }>({ field: null, order: null });

  const filteredData = useMemo(() => data ? data.results.filter((x) => (
    (!query.accountName || x.accountName.includes(query.accountName))
  )) : undefined, [data, query]);

  const getTotalDebtAmount =
    (data: Static<typeof GetWhitelistedAccountsSchema["responses"]["200"]> | undefined): number => {
      const sum = data?.results.filter((acct) => !acct.balance?.positive)
        .reduce((acc, acct) => {
          const debtAmount = acct.balance ? moneyToNumber(acct.balance) : 0;
          return acc + debtAmount;
        }, 0);
      return sum ? Math.abs(sum) : 0;
    };

  const handleTableChange = (_, __, sortInfo) => {
    setCurrentSortInfo({ field: sortInfo.field, order: sortInfo.order });
  };

  return (
    <div>
      <FilterFormContainer>
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
      </FilterFormContainer>
      <>
        <TableTitle justify="flex-start">
          {
            data ? (
              <div>
                <span>
                  白名单数量：<strong>{data.results.length ?? 0}</strong>
                </span>
                <>
                  <Divider type="vertical" />
                  <span>
                    白名单欠费合计：<strong>{getTotalDebtAmount(data).toFixed(3)} 元</strong>
                  </span>
                </>
              </div>
            ) : undefined
          }
        </TableTitle>
        <Table
          dataSource={filteredData}
          loading={isLoading}
          rowKey="accountName"
          scroll={{ x: true }}
          pagination={{
            showSizeChanger: true,
            current: currentPageNum,
            onChange: (page) => setCurrentPageNum(page),
          }}
          onChange={handleTableChange}
        >
          <Table.Column<WhitelistedAccount>
            dataIndex="accountName"
            title="账户名"
            sorter={(a, b) => a.accountName.localeCompare(b.accountName)}
            sortDirections={["ascend", "descend"]}
            sortOrder={currentSortInfo.field === "accountName" ? currentSortInfo.order : null}
          />
          <Table.Column<WhitelistedAccount>
            dataIndex="ownerId"
            title="拥有者"
            render={(_, r) => `${r.ownerName} (id: ${r.ownerId})`}
          />
          <Table.Column<WhitelistedAccount>
            dataIndex="balance"
            title="余额"
            sorter={(a, b) => (a.balance ? moneyToNumber(a.balance) : 0) - (b.balance ? moneyToNumber(b.balance) : 0)}
            sortDirections={["ascend", "descend"]}
            sortOrder={currentSortInfo.field === "balance" ? currentSortInfo.order : null}
            render={(b: Money) => moneyToString(b) + " 元" }
          />
          <Table.Column
            dataIndex="addTime"
            title="加入时间"
            render={(time: string) => formatDateTime(time) }
          />
          <Table.Column<WhitelistedAccount> dataIndex="comment" title="备注" />
          <Table.Column<WhitelistedAccount> dataIndex="operatorId" title="操作人" />
          <Table.Column<WhitelistedAccount>
            title="操作"
            render={(_, r) => (
              <Space split={<Divider type="vertical" />}>
                <a onClick={() => {
                  modal.confirm({
                    title: "确认将账户移除白名单？",
                    icon: <ExclamationCircleOutlined />,
                    content: `确认要将账户${r.accountName}从白名单移除？`,
                    onOk: async () => {
                      await api.dewhitelistAccount({ query: {
                        accountName: r.accountName,
                      } })
                        .then(() => {
                          message.success("移出白名单成功！");
                          reload();
                        });
                    },
                  });
                }}
                >
                  从白名单中去除
                </a>
              </Space>
            )}
          />
        </Table>
      </>
    </div>
  );
};
