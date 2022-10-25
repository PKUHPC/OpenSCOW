import { Button, Form, Input, message, Select, Table } from "antd";
import { useCallback, useState } from "react";
import { useAsync } from "react-async";
import { api } from "src/apis";
import { SingleClusterSelector } from "src/components/ClusterSelector";
import { AccountInfo, UserInfo } from "src/generated/server/admin";
import { Cluster, publicConfig } from "src/utils/config";
import styled from "styled-components";

const Title = styled.div`
  display: flex;
  justify-content: space-between;
`;


export const ImportUsersTable: React.FC = () => {
  const [query, setQuery] = useState<Cluster>(() => {
    return Object.values(publicConfig.CLUSTERS)[0]; 
  });

  // const [form] = Form.useForm<Cluster>();

  // const [loading, setLoading] = useState(false);

  const promiseFn = useCallback(async () => {
    return await api.getClusterUsers({ query: {
      cluster: query.id,
    } });
  }, [query]);

  const { data, isLoading, reload } = useAsync({ promiseFn });

  return (
    <div>
      <SingleClusterSelector 
        // value={Object.values(publicConfig.CLUSTERS)[0]} 
        onChange={async (value) => { setQuery(value); }} 
      />
      {/* <Form
        layout="inline"
        form={form}
        onFinish={async () => {
          // setLoading(true);
          setQuery(await form.validateFields());
          // setLoading(false);
        }}
      >
        <Form.Item name="clusterName" label="集群" rules={[{ required: true }]}>
          <SingleClusterSelector />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            获取用户信息
          </Button>
        </Form.Item>
      </Form> */}
      <UserTable data={data?.users} loading={isLoading} reload={reload} />
      <AccountTable data={data?.accounts} loading={isLoading} reload={reload} />
      <Button onClick={async () => {
        if (data?.accounts.find((x) => x.owner === undefined) !== undefined) {
          message.error("每个账户必须有一个拥有者");
        }
        else {
          await api.importUsers({ body: {
            data: data || { accounts:[], users:[]},
            whitelist: true,
          } })
            .then(() => { message.success("导入成功"); });
        }
      }}
      >
        导入
      </Button>
    </div>
  );
};

interface DataTableProps<T> {
  data: T[] | undefined;
  loading: boolean;
  reload: () => void;
}

const UserTable: React.FC<DataTableProps<UserInfo>> = ({ data, loading, reload }) => {
  return (
    <Table
      loading={loading}
      dataSource={data}
      scroll={{ x:true }}
      bordered
      rowKey="userId"
      title={() => <Title><span>用户</span><a onClick={reload}>刷新</a></Title>}
    >
      <Table.Column<UserInfo> dataIndex="userId" title="用户ID" width={200} />
      <Table.Column<UserInfo> 
        dataIndex="name" 
        title="姓名" 
        width={200}
        render={(_, r) => (
          <Input 
            placeholder="输入用户姓名（默认为用户ID）" 
            allowClear
            defaultValue={r.userName}
            onChange={(e) => { r.userName = e.target.value; }}
          />
        )}
      />
      <Table.Column<UserInfo> 
        dataIndex="accounts" 
        title="所属账户" 
        render={(_, r) => r.accounts.join(", ")}
      />
    </Table>
  );
};

const AccountTable: React.FC<DataTableProps<AccountInfo>> = ({ data, loading, reload }) => {
  return (
    <Table
      loading={loading}
      dataSource={data}
      scroll={{ x:true }}
      pagination={{ showSizeChanger: true }}
      rowKey="accountName"
      bordered
      title={() => <Title><span>账户</span><a onClick={reload}>刷新</a></Title>}
    >
      <Table.Column<AccountInfo> dataIndex="accountName" title="账户名" width={400} />
      <Table.Column<AccountInfo> 
        dataIndex="owner"
        title="拥有者"
        render={(_, r) => (
          <Select
            defaultValue={r.owner}
            onChange={(value) => { r.owner = value; }}
            options={r.users.map((user) => ({ value: user.userId, label: user.userId }))}
            style={{ width: "100%" }}
            placeholder={"请选择一个拥有者"}
          />         
        )}
      />
    </Table>
  );
};