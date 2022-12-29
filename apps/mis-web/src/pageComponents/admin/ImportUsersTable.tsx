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
import { ClusterAccountInfo, ClusterUserInfo,
  GetClusterUsersResponse, ImportUsersData } from "@scow/protos/build/server/admin";
import { App, Button, Checkbox, Form, Input, Select, Space, Table, Tabs, Tooltip } from "antd";
import Router from "next/router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAsync } from "react-async";
import { useStore } from "simstate";
import { api } from "src/apis";
import { SingleClusterSelector } from "src/components/ClusterSelector";
import { FilterFormContainer } from "src/components/FilterFormContainer";
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

  const selectedUsers = useMemo(() => data?.users.filter(
    (x) => (!x.included)).map((x) => (x.userId)), [data],
  );
  const selectedAccounts = useMemo(() => data?.accounts.filter(
    (x) => (!x.included)).map((x) => (x.accountName)), [data],
  );

  return (
    <div>
      <FilterFormContainer>
        <Form layout="inline">
          <Form.Item label="集群">
            <SingleClusterSelector
              value={cluster}
              onChange={(value) => {
                Router.push({ query: { cluster: value.id } });
              }}
            />
          </Form.Item>
        </Form>
      </FilterFormContainer>
      <Form
        form={form}
        onFinish={async () => {
          if (!data) return;

          setLoading(true);

          const { data: changedData, whitelist } = await form.validateFields();
          const importData: ImportUsersData = { accounts: [], users: []};

          changedData.users.forEach((x, i) => {
            if (!data.users[i].included) {
              data.users[i].userName = x.userName;
              importData.users.push({
                userId: data.users[i].userId,
                userName: data.users[i].userName,
                accounts: data.users[i].accounts,
              });
            }
          });
          changedData.accounts.forEach((x, i) => {
            if (!data.accounts[i].included) {
              data.accounts[i].owner = x.owner;
              importData.accounts.push({
                accountName: data.accounts[i].accountName,
                users: data.accounts[i].users,
                owner: data.accounts[i].owner!,
              });
            }
          });

          await api.importUsers({ body: {
            data: importData,
            whitelist: whitelist,
          } })
            .httpError(400, () => { message.error("数据格式不正确"); })
            .then(() => { message.success("导入成功"); })
            .finally(() => { setLoading(false); });
        }}
      >
        <Tabs
          defaultActiveKey="user"
          tabBarExtraContent={(
            <Space size="large">
              <a onClick={reload}>
                刷新
              </a>
              <Button type="primary" htmlType="submit" loading={loading}>
                提交
              </Button>
            </Space>
          )}
        >
          <Tabs.TabPane tab="用户" key="user" forceRender={true}>
            <Table
              rowSelection={{
                selectedRowKeys: selectedUsers,
                type: "checkbox",
                renderCell(_checked, record, _index, node) {
                  if (record.included) {
                    return <Tooltip title="用户已经存在于SCOW中">{node}</Tooltip>;
                  }
                  else {
                    return <Tooltip title="用户不存在于SCOW中，将会导入SCOW">{node}</Tooltip>;
                  }
                },
                getCheckboxProps: () => ({
                  disabled: true,
                }),
              }}
              loading={isLoading}
              dataSource={data?.users}
              scroll={{ x:true }}
              bordered
              rowKey="userId"
            >
              <Table.Column<ClusterUserInfo> dataIndex="userId" title="用户ID" key="userId" width={200} />
              <Table.Column<ClusterUserInfo>
                dataIndex="name"
                title="姓名"
                width={200}
                render={(_text, record, index) => record.included ? record.userName : (
                  <Form.Item name={["data", "users", index, "userName"]} rules={[{ required: true, message: "请输入姓名" }]}>
                    <Input
                      placeholder="输入用户姓名"
                      allowClear
                    />
                  </Form.Item>
                )}
              />
              <Table.Column<ClusterUserInfo>
                dataIndex="accounts"
                key="accounts"
                title="所属账户"
                render={(_, r) => r.accounts.join(", ")}
              />
            </Table>
          </Tabs.TabPane>
          <Tabs.TabPane tab="账户" key="account" forceRender={true}>
            <Table
              rowSelection={{
                selectedRowKeys: selectedAccounts,
                type: "checkbox",
                renderCell(_checked, record, _index, node) {
                  if (record.included) {
                    return <Tooltip title="账户已经存在于SCOW中">{node}</Tooltip>;
                  }
                  else {
                    return <Tooltip title="账户不存在于SCOW中，将会导入SCOW">{node}</Tooltip>;
                  }
                },
                getCheckboxProps: () => ({
                  disabled: true,
                }),
              }}
              loading={isLoading}
              dataSource={data?.accounts}
              scroll={{ x:true }}
              pagination={{ showSizeChanger: true }}
              rowKey="accountName"
              bordered
            >
              <Table.Column<ClusterAccountInfo> dataIndex="accountName" title="账户名" width={400} />
              <Table.Column<ClusterAccountInfo>
                dataIndex="owner"
                title="拥有者"
                render={(_, r, i) => r.included ? r.owner : (
                  <Form.Item name={["data", "accounts", i, "owner"]} rules={[{ required: true, message: "请选择一个拥有者" }]}>
                    <Select
                      defaultValue={r.owner}
                      options={r.users.map((user) => ({ value: user.userId, label: user.userId }))}
                      style={{ width: "100%" }}
                      placeholder={"请选择一个拥有者"}
                    />
                  </Form.Item>
                )}
              />
            </Table>
            <Form.Item name="whitelist" valuePropName="checked">
              <Checkbox>将所有账户加入白名单</Checkbox>
            </Form.Item>
          </Tabs.TabPane>
        </Tabs>
      </Form>
    </div>
  );
};
