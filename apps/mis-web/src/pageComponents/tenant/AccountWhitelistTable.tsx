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
import { DEFAULT_PAGE_SIZE } from "@scow/lib-web/build/utils/pagination";
import { WhitelistedAccount } from "@scow/protos/build/server/account";
import { Static } from "@sinclair/typebox";
import { App, Button, Divider, Form, Input, Space, Table } from "antd";
import { SortOrder } from "antd/lib/table/interface";
import React, { useMemo, useState } from "react";
import { api } from "src/apis";
import { TableTitle } from "src/components/TableTitle";
import { prefix, useI18nTranslateToString } from "src/i18n";
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
const p = prefix("pageComp.tenant.accountWhitelistTable.");
const pCommon = prefix("common.");

export const AccountWhitelistTable: React.FC<Props> = ({
  data, isLoading, reload,
}) => {

  const t = useI18nTranslateToString();

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
          <Form.Item label={t(pCommon("account"))} name="accountName">
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">{t(pCommon("search"))}</Button>
          </Form.Item>
        </Form>
      </FilterFormContainer>
      <>
        <TableTitle justify="flex-start">
          {
            data ? (
              <div>
                <span>
                  {t(p("whiteList"))}：<strong>{data.results.length ?? 0}</strong>
                </span>
                <>
                  <Divider type="vertical" />
                  <span>
                    {t(p("debtSum"))}：<strong>{getTotalDebtAmount(data).toFixed(3)} {t(pCommon("unit"))}</strong>
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
            defaultPageSize: DEFAULT_PAGE_SIZE,
            current: currentPageNum,
            onChange: (page) => setCurrentPageNum(page),
          }}
          onChange={handleTableChange}
        >
          <Table.Column<WhitelistedAccount>
            dataIndex="accountName"
            title={t(pCommon("accountName"))}
            sorter={(a, b) => a.accountName.localeCompare(b.accountName)}
            sortDirections={["ascend", "descend"]}
            sortOrder={currentSortInfo.field === "accountName" ? currentSortInfo.order : null}
          />
          <Table.Column<WhitelistedAccount>
            dataIndex="ownerId"
            title={t(pCommon("owner"))}
            render={(_, r) => `${r.ownerName} (ID: ${r.ownerId})`}
          />
          <Table.Column<WhitelistedAccount>
            dataIndex="balance"
            title={t(pCommon("balance"))}
            sorter={(a, b) => (a.balance ? moneyToNumber(a.balance) : 0) - (b.balance ? moneyToNumber(b.balance) : 0)}
            sortDirections={["ascend", "descend"]}
            sortOrder={currentSortInfo.field === "balance" ? currentSortInfo.order : null}
            render={(b: Money) => moneyToString(b) + " " + t(pCommon("unit")) }
          />
          <Table.Column
            dataIndex="addTime"
            title={t(p("joinTime"))}
            render={(time: string) => formatDateTime(time) }
          />
          <Table.Column<WhitelistedAccount> dataIndex="comment" title={t(pCommon("comment"))} />
          <Table.Column<WhitelistedAccount> dataIndex="operatorId" title={t(p("operatorId"))} />
          <Table.Column<WhitelistedAccount>
            title={t(pCommon("operation"))}
            render={(_, r) => (
              <Space split={<Divider type="vertical" />}>
                <a onClick={() => {
                  modal.confirm({
                    title: t(p("confirmRemoveWhite")),
                    icon: <ExclamationCircleOutlined />,
                    content: `${t(p("confirmRemoveWhiteText1"))}${r.accountName}${t(p("confirmRemoveWhiteText2"))}`,
                    onOk: async () => {
                      await api.dewhitelistAccount({ query: {
                        accountName: r.accountName,
                      } })
                        .then(() => {
                          message.success(t(p("removeWhiteSuccess")));
                          reload();
                        });
                    },
                  });
                }}
                >
                  {t(p("removeWhite"))}
                </a>
              </Space>
            )}
          />
        </Table>
      </>
    </div>
  );
};
