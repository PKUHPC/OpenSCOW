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
import { Money } from "@scow/protos/build/common/money";
import { Static } from "@sinclair/typebox";
import { App, Button, Divider, Form, Input, Space, Table, Tag } from "antd";
import { SortOrder } from "antd/es/table/interface";
import Link from "next/link";
import React, { useMemo, useState } from "react";
import { api } from "src/apis";
import { FilterFormContainer, FilterFormTabs } from "src/components/FilterFormContainer";
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
  "ALL": "所有账户",
  "DEBT": "欠费账户",
  "BLOCKED": "封锁账户",
};
type FilteredStatus = keyof typeof filteredStatuses;

export const AccountTable: React.FC<Props> = ({
  data, isLoading, showedTab, reload,
}) => {

  const { message, modal } = App.useApp();
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
          render={(_, r) => `${r.ownerName}（ID: ${r.ownerId}）`}
        />
        <Table.Column<AdminAccountInfo>
          dataIndex="userCount"
          title="用户数量"
        />
        {/* 只在平台管理下的账户列表中显示 */}
        {showedTab === "PLATFORM" && (
          <Table.Column<AdminAccountInfo>
            dataIndex="tenantName"
            title="租户"
          />
        )}
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
              {/* 只在租户管理下的账户列表中显示管理成员 */}
              {showedTab === "TENANT" && (
                <Link href={{ pathname: `/tenant/accounts/${r.accountName}/users` }}>
                  管理成员
                </Link>
              )}
              {
                r.blocked
                  ? (
                    <a onClick={() => {
                      if (moneyToNumber(r.balance) < 0) {
                        message.error(`账户${r.accountName}已欠费，您可以将其加入白名单或充值解封`);
                        return;
                      }
                      modal.confirm({
                        title: "确认解除用户封锁？",
                        icon: <ExclamationCircleOutlined />,
                        content: `确认要在租户${r.tenantName}中解除账户${r.accountName}的封锁？`,
                        onOk: async () => {
                          await api.unblockAccount({
                            body: {
                              tenantName: r.tenantName,
                              accountName: r.accountName,
                            },
                          })
                            .then((res) => {
                              if (res.executed) {
                                message.success("解封账户成功！");
                                reload();
                              } else {
                                message.error(res.reason || "解封账户失败！");
                              }
                            });
                        },
                      });
                    }}
                    >
                      解除封锁
                    </a>
                  ) : (
                    <a onClick={() => {
                      modal.confirm({
                        title: "确认封锁账户？",
                        icon: <ExclamationCircleOutlined />,
                        content: `确认要在租户${r.tenantName}中封锁账户${r.accountName}？`,
                        onOk: async () => {
                          await api.blockAccount({
                            body: {
                              tenantName: r.tenantName,
                              accountName: r.accountName,
                            },
                          })
                            .then((res) => {
                              if (res.executed) {
                                message.success("封锁帐户成功！");
                                reload();
                              } else {
                                message.error(res.reason || "封锁帐户失败！");
                              }
                            });
                        },
                      });
                    }}
                    >
                      封锁
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
