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

import { queryToString, useQuerystring } from "@scow/lib-web/build/utils/querystring";
import { ClusterAccountInfo, GetClusterUsersResponse,
  ImportUsersData, UserInAccount } from "@scow/protos/build/server/admin";
import { App, Button, Checkbox, Drawer, Form, Select, Space, Table, Tooltip } from "antd";
import Router from "next/router";
import React, { useCallback, useEffect, useState } from "react";
import { useAsync } from "react-async";
import { useStore } from "simstate";
import { api } from "src/apis";
import { SingleClusterSelector } from "src/components/ClusterSelector";
import { FilterFormContainer } from "src/components/FilterFormContainer";
import { ClusterAccountInfo_ImportStatus } from "src/models/User";
import { DefaultClusterStore } from "src/stores/DefaultClusterStore";
import { publicConfig } from "src/utils/config";


export const ImportUsersTable: React.FC = () => {
  const { message } = App.useApp();

  const qs = useQuerystring();

  const defaultClusterStore = useStore(DefaultClusterStore);

  const clusterParam = queryToString(qs.cluster);
  const cluster = (publicConfig.CLUSTERS[clusterParam]
    ? publicConfig.CLUSTERS[clusterParam]
    : defaultClusterStore.cluster);

  const [form] = Form.useForm<{data: GetClusterUsersResponse, whitelist: boolean}>();

  const [loading, setLoading] = useState(false);

  const promiseFn = useCallback(async () => {
    return await api.getClusterUsers({ query: {
      cluster: cluster.id,
    } });
  }, [cluster]);

  const { data, isLoading, reload } = useAsync({ promiseFn });

  useEffect(() => {
    form.setFieldsValue({
      data: data,
      whitelist: true,
    });
  }, [data]);

  const [selectedAccounts, setSelectedAccounts] = useState<ClusterAccountInfo[]>();
  const [usersList, setusersList] = useState<UserInAccount[] | undefined>(undefined);

  return (
    <div>

      <Form
        form={form}
        onFinish={async () => {
          if (!data) return;

          setLoading(true);

          const { data: changedData, whitelist } = await form.validateFields();
          const importData: ImportUsersData = { accounts: []};

          changedData?.accounts.forEach((x, i) => {
            if (data.accounts[i].importStatus === ClusterAccountInfo_ImportStatus.NOT_EXISTING) {
              data.accounts[i].owner = x.owner;
            }
          });

          importData.accounts.push(...selectedAccounts?.map((x) => ({
            accountName: x.accountName,
            users: x.users,
            owner: x.importStatus === ClusterAccountInfo_ImportStatus.NOT_EXISTING ? x.owner! : undefined,
          })) || []);

          await api.importUsers({ body: {
            data: importData,
            whitelist,
          } })
            .httpError(400, () => { message.error("数据格式不正确"); })
            .then(() => { message.success("导入成功"); })
            .finally(() => {
              setLoading(false);
              reload();
            });
        }}
      >
        <FilterFormContainer>
          <Space align="center">
            选择集群，以账户为单位导入到默认租户中
            <SingleClusterSelector
              value={cluster}
              onChange={(value) => {
                Router.push({ query: { cluster: value.id } });
              }}
            />
            <Button type="primary" htmlType="submit" loading={loading}>
              导入
            </Button>
            <a onClick={reload}>
              刷新
            </a>
          </Space>
        </FilterFormContainer>
        <Table
          rowSelection={{
            type: "checkbox",
            renderCell(_checked, record, _index, node) {
              if (record.importStatus === ClusterAccountInfo_ImportStatus.EXISTING) {
                return <Tooltip title="账户已经存在于SCOW中">{node}</Tooltip>;
              } else if (record.importStatus === ClusterAccountInfo_ImportStatus.NOT_EXISTING) {
                return <Tooltip title="账户不存在于SCOW中，将会导入SCOW">{node}</Tooltip>;
              } else if (record.importStatus === ClusterAccountInfo_ImportStatus.HAS_NEW_USERS) {
                return <Tooltip title="账户中部分用户不存在于SCOW中，将会导入新的用户">{node}</Tooltip>;
              }
            },
            getCheckboxProps: (r) => ({
              disabled: r.importStatus === ClusterAccountInfo_ImportStatus.EXISTING,
            }),
            onChange: (_, sr) => {
              setSelectedAccounts(sr);
            },
          }}
          loading={isLoading}
          dataSource={data?.accounts}
          scroll={{ x:true }}
          pagination={{ showSizeChanger: true }}
          rowKey="accountName"
          bordered
        >
          <Table.Column<ClusterAccountInfo> dataIndex="accountName" title="账户名" />
          <Table.Column<ClusterAccountInfo>
            dataIndex="owner"
            title="拥有者"
            render={(_, r, i) => {
              return r.importStatus === ClusterAccountInfo_ImportStatus.NOT_EXISTING
                ? selectedAccounts?.includes(r)
                  ? (
                    <Form.Item
                      name={["data", "accounts", i, "owner"]}
                      rules={[{ required: true, message: "请选择一个拥有者" }]}
                    >
                      <Select
                        defaultValue={r.owner}
                        options={r.users.map((user) => ({ value: user.userId, label: user.userId }))}
                        style={{ width: "100%" }}
                        placeholder={"请选择一个拥有者"}
                      />
                    </Form.Item>
                  )
                  : ""
                : "";
            }
            }

          />
          <Table.Column<ClusterAccountInfo>
            dataIndex="importStatus"
            title="导入状态"
            render={(value) => {
              if (value === ClusterAccountInfo_ImportStatus.EXISTING) {
                return "已导入";
              } else if (value === ClusterAccountInfo_ImportStatus.HAS_NEW_USERS) {
                return "账户已导入，部分用户未导入";
              } else {
                return "未导入";
              }
            }}
          />
          <Table.Column<ClusterAccountInfo>
            dataIndex="users"
            title="用户列表"
            render={(_, r) => (
              <a onClick={() => setusersList(r.users)}>查看</a>
            )}
          />
        </Table>
        <Form.Item name="whitelist" valuePropName="checked">
          <Checkbox>将所有账户加入白名单</Checkbox>
        </Form.Item>
        <Drawer
          placement="right"
          onClose={() => setusersList(undefined)}
          open={usersList !== undefined}
          title="用户列表"
        >
          <Table
            dataSource={usersList}
          >
            <Table.Column<UserInAccount> dataIndex="userId" title="用户ID" />
          </Table>
        </Drawer>
      </Form>
    </div>
  );
};
