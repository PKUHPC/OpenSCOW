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
import { DEFAULT_PAGE_SIZE } from "@scow/lib-web/build/utils/pagination";
import { Money } from "@scow/protos/build/common/money";
import { Static } from "@sinclair/typebox";
import { App, Button, Divider, Form, Input, Space, Table, Tag } from "antd";
import { SortOrder } from "antd/es/table/interface";
import Link from "next/link";
import React, { useMemo, useState } from "react";
import { api } from "src/apis";
import { FilterFormContainer, FilterFormTabs } from "src/components/FilterFormContainer";
import { prefix, useI18nTranslateToString } from "src/i18n";
import { ExportFileModaLButton } from "src/pageComponents/common/exportFileModal";
import { MAX_EXPORT_COUNT, urlToExport } from "src/pageComponents/file/apis";
import type { AdminAccountInfo, GetAccountsSchema } from "src/pages/api/tenant/getAccounts";
import { moneyToString } from "src/utils/money";

type ShowedTab = "PLATFORM" | "TENANT";
interface Props {
  data: Static<typeof GetAccountsSchema["responses"]["200"]> | undefined;
  isLoading: boolean;
  reload: () => void;
  showedTab: ShowedTab;
}

interface FilterForm {
  accountName: string | undefined;
}

const filteredStatuses = {
  "ALL": "pageComp.accounts.accountTable.allAccount",
  "DEBT": "pageComp.accounts.accountTable.debtAccount",
  "BLOCKED": "pageComp.accounts.accountTable.blockedAccount",
};
type FilteredStatus = keyof typeof filteredStatuses;

const p = prefix("pageComp.accounts.accountTable.");
const pCommon = prefix("common.");

export const AccountTable: React.FC<Props> = ({
  data, isLoading, showedTab, reload,
}) => {

  const { message, modal } = App.useApp();
  const [form] = Form.useForm<FilterForm>();

  const t = useI18nTranslateToString();

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

  const searchData = useMemo(() => data ? data.results.filter((x) => (
    !query.accountName || x.accountName.includes(query.accountName)
  )) : undefined, [data, query]);

  const usersStatusCount = useMemo(() => {
    if (!searchData) return { BLOCKED : 0, DEBT : 0, ALL : 0 };
    const counts = {
      BLOCKED: searchData.filter((user) => user.blocked).length,
      DEBT: searchData.filter((user) => !user.balance.positive).length,
      ALL: searchData.length,
    };
    return counts;
  }, [searchData]);

  const handleTableChange = (_, __, sortInfo) => {
    setCurrentSortInfo({ field: sortInfo.field, order: sortInfo.order });
  };

  const handleFilterStatusChange = (status: FilteredStatus) => {
    setRangeSearchStatus(status);
    setCurrentPageNum(1);
    setCurrentSortInfo({ field: null, order: null });
  };

  const handleExport = async (columns: string[]) => {

    const total = filteredData?.length || 0;

    if (total > MAX_EXPORT_COUNT) {
      message.error(t(pCommon("exportMaxDataErrorMsg"), [MAX_EXPORT_COUNT]));
    } else if (total <= 0) {
      message.error(t(pCommon("exportNoDataErrorMsg")));
    } else {

      window.location.href = urlToExport({
        exportApi: "exportAccount",
        columns,
        count: total,
        query: {
          accountName: query.accountName,
          blocked: rangeSearchStatus === "BLOCKED",
          debt: rangeSearchStatus === "DEBT",
          isFromAdmin: showedTab === "PLATFORM",
        },
      });
    }
  };

  const exportOptions = useMemo(() => {
    const common = [
      { label: t(p("accountName")), value: "accountName" },
      { label: t(p("owner")), value: "owner" },
      { label: t(pCommon("userCount")), value: "userCount" },
    ];

    const tenant = showedTab === "PLATFORM" ? [
      { label: t(p("tenant")), value: "tenantName" },
    ] : [];
    const remaining = [
      { label: t(pCommon("balance")), value: "balance" },
      { label:  t(p("status")), value: "blocked" },
      { label: t(p("comment")), value: "comment" },
    ];
    return [...common, ...tenant, ...remaining];
  }, [showedTab, t]);

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
          <Form.Item label={t(p("account"))} name="accountName">
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">{t(pCommon("search"))}</Button>
          </Form.Item>
          <Form.Item>
            <ExportFileModaLButton
              options={exportOptions}
              onExport={handleExport}
            >
              {t(pCommon("export"))}
            </ExportFileModaLButton>
          </Form.Item>
        </Form>
        <Space style={{ marginBottom: "-16px" }}>
          <FilterFormTabs
            tabs={Object.keys(filteredStatuses).map((status) => ({
              title: `${t(filteredStatuses[status])}(${usersStatusCount[status as FilteredStatus]})`,
              key: status,
            }))}
            onChange={(value) => handleFilterStatusChange(value as FilteredStatus)}
          />
        </Space>
      </FilterFormContainer>

      <Table
        tableLayout="fixed"
        dataSource={filteredData}
        loading={isLoading}
        pagination={{
          showSizeChanger: true,
          defaultPageSize: DEFAULT_PAGE_SIZE,
          current: currentPageNum,
          onChange: (page) => setCurrentPageNum(page),
        }}
        rowKey="userId"
        scroll={{ x: filteredData?.length ? 1200 : true }}
        onChange={handleTableChange}
      >
        <Table.Column<AdminAccountInfo>
          dataIndex="accountName"
          title={t(p("accountName"))}
          sorter={(a, b) => a.accountName.localeCompare(b.accountName)}
          sortDirections={["ascend", "descend"]}
          sortOrder={currentSortInfo.field === "accountName" ? currentSortInfo.order : null}
        />
        <Table.Column<AdminAccountInfo>
          dataIndex="ownerName"
          width="25%"
          title={t(p("owner"))}
          render={(_, r) => `${r.ownerName}（ID: ${r.ownerId}）`}
        />
        <Table.Column<AdminAccountInfo>
          dataIndex="userCount"
          width="8%"
          title={t(pCommon("userCount"))}
        />
        {/* 只在平台管理下的账户列表中显示 */}
        {showedTab === "PLATFORM" && (
          <Table.Column<AdminAccountInfo>
            dataIndex="tenantName"
            width="10%"
            title={t(p("tenant"))}
          />
        )}
        <Table.Column<AdminAccountInfo>
          dataIndex="balance"
          width="13%"
          title={t(pCommon("balance"))}
          sorter={(a, b) => (moneyToNumber(a.balance)) - (moneyToNumber(b.balance))}
          sortDirections={["ascend", "descend"]}
          sortOrder={currentSortInfo.field === "balance" ? currentSortInfo.order : null}
          render={(b: Money) => moneyToString(b) + t(p("unit")) }
        />
        <Table.Column<AdminAccountInfo>
          dataIndex="blocked"
          width="7%"
          title={t(p("status"))}
          sorter={(a, b) => (a.blocked ? 1 : 0) - (b.blocked ? 1 : 0)}
          sortDirections={["ascend", "descend"]}
          sortOrder={currentSortInfo.field === "blocked" ? currentSortInfo.order : null}
          render={(blocked) => blocked ? <Tag color="red">{t(p("block"))}</Tag> :
            <Tag color="green">{t(p("normal"))}</Tag>}
        />
        <Table.Column<AdminAccountInfo>
          dataIndex="comment"
          ellipsis
          title={t(p("comment"))}
        />
        <Table.Column<AdminAccountInfo>
          title={t(pCommon("operation"))}
          width="15%"
          fixed="right"
          render={(_, r) => (
            <Space split={<Divider type="vertical" />}>
              {/* 只在租户管理下的账户列表中显示管理成员 */}
              {showedTab === "TENANT" && (
                <Link href={{ pathname: `/tenant/accounts/${r.accountName}/users` }}>
                  {t(p("mangerMember"))}
                </Link>
              )}
              {
                r.blocked
                  ? (
                    <a onClick={() => {
                      if (moneyToNumber(r.balance) > 0) {
                        modal.confirm({
                          title: t(p("unblockConfirmTitle")),
                          icon: <ExclamationCircleOutlined />,
                          content: t(p("unblockConfirmContent"), [r.tenantName, r.accountName]),
                          onOk: async () => {
                            await api.unblockAccount({
                              body: {
                                tenantName: r.tenantName,
                                accountName: r.accountName,
                              },
                            })
                              .then((res) => {
                                if (res.executed) {
                                  message.success(t(p("unblockSuccess")));
                                  reload();
                                } else {
                                  message.error(res.reason || t(p("unblockFail")));
                                }
                              });
                          },
                        });
                      } else {
                        message.error(t(p("unblockError"), [r.accountName]));
                      }

                    }}
                    >
                      {t(p("unblock"))}
                    </a>
                  ) : (
                    <a onClick={() => {
                      modal.confirm({
                        title: t(p("blockConfirmTitle")),
                        icon: <ExclamationCircleOutlined />,
                        content: t(p("blockConfirmContent"), [r.tenantName, r.accountName]),
                        onOk: async () => {
                          await api.blockAccount({
                            body: {
                              tenantName: r.tenantName,
                              accountName: r.accountName,
                            },
                          })
                            .then((res) => {
                              if (res.executed) {
                                message.success(t(p("blockSuccess")));
                                reload();
                              } else {
                                message.error(res.reason || t(p("blockFail")));
                              }
                            });
                        },
                      });
                    }}
                    >
                      {t(p("block"))}
                    </a>
                  )
              }
            </Space>
          )}
        />
      </Table>
    </div>
  );
};
