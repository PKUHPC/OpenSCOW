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
import { formatDateTime } from "@scow/lib-web/build/utils/datetime";
import { WhitelistedAccount } from "@scow/protos/build/server/account";
import { Divider, Space, Table } from "antd";
import React from "react";
import { api } from "src/apis";
import { useMessage, useModal } from "src/layouts/prompts";
import type {
  GetWhitelistedAccountsSchema } from "src/pages/api/tenant/accountWhitelist/getWhitelistedAccounts";

interface Props {
  data: GetWhitelistedAccountsSchema["responses"]["200"] | undefined;
  isLoading: boolean;
  reload: () => void;
}

export const AccountWhitelistTable: React.FC<Props> = ({
  data, isLoading, reload,
}) => {

  const modal = useModal();
  const message = useMessage();

  return (
    <Table
      dataSource={data?.results}
      loading={isLoading}
      rowKey="accountName"
      scroll={{ x: true }}
      pagination={{ showSizeChanger: true }}
    >
      <Table.Column<WhitelistedAccount> dataIndex="accountName" title="账户名" />
      <Table.Column<WhitelistedAccount>
        dataIndex="ownerId"
        title="拥有者"
        render={(_, r) => `${r.ownerName} (id: ${r.ownerId})`}
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
                  await api.dewhitelistAccount({ body: {
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
  );
};
