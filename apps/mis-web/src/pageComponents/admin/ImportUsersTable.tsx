import { Button, Checkbox, Form, Input, message, Select, Table, Tabs } from "antd";
import Router from "next/router";
import { useCallback, useEffect, useState } from "react";
import { useAsync } from "react-async";
import { api } from "src/apis";
import { SingleClusterSelector } from "src/components/ClusterSelector";
import { ClusterAccountInfo, ClusterUserInfo, GetClusterUsersReply } from "src/generated/server/admin";
import { publicConfig } from "src/utils/config";
import { queryToString, useQuerystring } from "src/utils/querystring";
import styled from "styled-components";

const Title = styled.div`
  display: flex;
  justify-content: space-between;
`;

const ClusterContainer = styled.div`
padding: 8px 16px 16px 16px;
margin: 8px 0;
background: #fbfbfb;
border: 1px solid #d9d9d9;
border-radius: 2px;

.ant-form-item {
  margin: 4px;
}
`;

export const ImportUsersTable: React.FC = () => {

  const qs = useQuerystring();

  const clusterParam = queryToString(qs.cluster);
  const cluster = (publicConfig.CLUSTERS[clusterParam]
    ? publicConfig.CLUSTERS[clusterParam]
    : Object.values(publicConfig.CLUSTERS)[0]);

  const [form] = Form.useForm<{data:GetClusterUsersReply, whitelist:boolean}>();

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

  return (
    <div>
      <ClusterContainer>
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
      </ClusterContainer>
      <Form
        form={form}
        onFinish={async () => {
          if (!data) return;

          setLoading(true);

          const { data: changedData, whitelist } = await form.validateFields();
          changedData.users.forEach((x, i) => data.users[i].userName = x.userName);
          changedData.accounts.forEach((x, i) => data.accounts[i].owner = x.owner);
          
          await api.importUsers({ body: {
            data: data,
            whitelist: whitelist,
          } })
            .httpError(400, () => { message.error("数据格式不正确"); })
            .then(() => { message.success("导入成功"); })
            .finally(() => { setLoading(false); });
        }}
      >
        <Tabs defaultActiveKey="user" tabBarExtraContent={<a onClick={reload}>刷新</a>}>
          <Tabs.TabPane tab="用户" key="user">
            <Table
              loading={isLoading}
              dataSource={data?.users}
              scroll={{ x:true }}
              bordered
              rowKey="userId"
              // title={() => <Title><span>用户</span><a onClick={reload}>刷新</a></Title>}
            >
              <Table.Column<ClusterUserInfo> dataIndex="userId" title="用户ID" key="userId" width={200} />
              <Table.Column<ClusterUserInfo> 
                dataIndex="name" 
                title="姓名" 
                width={200}
                render={(_, record:any, index:number) => (
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
          <Tabs.TabPane tab="账户" key="account">
            <Table
              loading={isLoading}
              dataSource={data?.accounts}
              scroll={{ x:true }}
              pagination={{ showSizeChanger: true }}
              rowKey="accountName"
              bordered
              // title={() => <Title><span>账户</span><a onClick={reload}>刷新</a></Title>}
            >
              <Table.Column<ClusterAccountInfo> dataIndex="accountName" title="账户名" width={400} />
              <Table.Column<ClusterAccountInfo> 
                dataIndex="owner"
                title="拥有者"
                render={(_, r, i) => (
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
            <Button type="primary" htmlType="submit" loading={loading}>
              提交
            </Button>
          </Tabs.TabPane>
        </Tabs>
      </Form>
    </div>
  );
};