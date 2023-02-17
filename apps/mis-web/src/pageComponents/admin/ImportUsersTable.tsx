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
import { DefaultClusterStore } from "src/stores/DefaultClusterStore";
import { publicConfig } from "src/utils/config";

import { TenantSelector } from "../tenant/TenantSelector";

export const ImportUsersTable: React.FC = () => {
  const { message } = App.useApp();

  const qs = useQuerystring();

  const defaultClusterStore = useStore(DefaultClusterStore);

  const clusterParam = queryToString(qs.cluster);
  const cluster = (publicConfig.CLUSTERS[clusterParam]
    ? publicConfig.CLUSTERS[clusterParam]
    : defaultClusterStore.cluster);

  const [form] = Form.useForm<{tenantName: string, data: GetClusterUsersResponse, whitelist: boolean}>();

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

          const { data: changedData, tenantName, whitelist } = await form.validateFields();
          const importData: ImportUsersData = { accounts: []};

          changedData?.accounts.forEach((x, i) => {
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
            tenantName,
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
            选择集群：
            <SingleClusterSelector
              value={cluster}
              onChange={(value) => {
                Router.push({ query: { cluster: value.id } });
              }}
            />
          </Space>
        </FilterFormContainer>
        <FilterFormContainer>
          <Space align="center">
            导入账户及账户下的用户到SCOW平台的
            <Form.Item name={"tenantName"}>
              <TenantSelector placeholder="选择租户" autoSelect />
            </Form.Item>
            租户中
            <Space size="large">
              <Button type="primary" htmlType="submit" loading={loading}>
              导入
              </Button>
              <a onClick={reload}>
              刷新
              </a>
            </Space>
          </Space>
        </FilterFormContainer>
        <Table
          rowSelection={{
            type: "checkbox",
            renderCell(_checked, record, _index, node) {
              if (record.included) {
                return <Tooltip title="账户已经存在于SCOW中">{node}</Tooltip>;
              }
              else {
                return <Tooltip title="账户不存在于SCOW中，将会导入SCOW">{node}</Tooltip>;
              }
            },
            getCheckboxProps: (r) => ({
              disabled: r.included,
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
            render={(_, r, i) => 
              r.included ? 
                "该账户已导入" : selectedAccounts?.includes(r) ? (
                  <Form.Item name={["data", "accounts", i, "owner"]} rules={[{ required: true, message: "请选择一个拥有者" }]}>
                    <Select
                      defaultValue={r.owner}
                      options={r.users.map((user) => ({ value: user.userId, label: user.userId }))}
                      style={{ width: "100%" }}
                      placeholder={"请选择一个拥有者"}
                    />
                  </Form.Item>
                ) : ""}
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
