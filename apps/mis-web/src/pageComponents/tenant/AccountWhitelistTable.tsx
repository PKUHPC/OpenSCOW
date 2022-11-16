import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Divider, message, Modal, notification, Space, Table } from "antd";
import React from "react";
import { api } from "src/apis";
import { WhitelistedAccount } from "src/generated/server/account";
import type {
  GetWhitelistedAccountsSchema } from "src/pages/api/tenant/accountWhitelist/getWhitelistedAccounts";
import { formatDateTime } from "src/utils/datetime";

interface Props {
  data: GetWhitelistedAccountsSchema["responses"]["200"] | undefined;
  isLoading: boolean;
  reload: () => void;
}

export const AccountWhitelistTable: React.FC<Props> = ({
  data, isLoading, reload,
}) => {

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
              Modal.confirm({
                title: "确认将账户移除白名单？",
                icon: <ExclamationCircleOutlined />,
                content: `确认要将账户${r.accountName}从白名单移除？`,
                onOk: async () => {
                  await api.dewhitelistAccount({ body: {
                    accountName: r.accountName,
                  } })
                    .httpError(500, (e) => {
                      notification["error"]({
                        message: "操作失败",
                        description: `多集群操作出现错误, 部分集群未同步修改(${e}), 请联系管理员!`,
                        duration: 0,
                      });
                    })
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
