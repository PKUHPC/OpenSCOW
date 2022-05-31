import { Button, Form, Space, Table, TableColumnsType } from "antd";
import Link from "next/link";
import React, { useCallback, useState } from "react";
import { useAsync } from "react-async";
import { api } from "src/apis";
import { SingleClusterSelector } from "src/components/ClusterSelector";
import { FilterFormContainer } from "src/components/FilterFormContainer";
import { AppSession } from "src/generated/portal/app";
import { Cluster, CLUSTERS, publicConfig } from "src/utils/config";
import { formatDateTime } from "src/utils/datetime";

interface Props {

}

interface FilterForm {
  cluster: Cluster;
}


export const AppSessionsTable: React.FC<Props> = () => {

  const [form] = Form.useForm<FilterForm>();

  const [query, setQuery] = useState<FilterForm>(() => {
    return {
      cluster: CLUSTERS[0],
    };
  });

  const { data, isLoading, reload } = useAsync({
    promiseFn: useCallback(async () => {
      // List all desktop
      const { sessions } = await api.getSessions({ query: { cluster: query.cluster.id } });

      return sessions;

    }, []),
  });

  const columns: TableColumnsType<AppSession> = [
    {
      title: "会话ID",
      dataIndex: "sessionId",
    },
    {
      title: "作业ID",
      dataIndex: "jobId",
    },
    {
      title: "应用",
      dataIndex: "appId",
      render: (appId: string) => publicConfig.APPS.find((x) => x.id === appId)?.name ?? appId,
    },
    {
      title: "提交时间",
      dataIndex: "submitTime",
      render: (_, record) => record.submitTime ? formatDateTime(record.submitTime) : "",
    },
    {
      title: "状态",
      dataIndex: "state",
    },

    {
      title: "操作",
      key: "action",
      width: "20%",
      render: (_, record) => (
        <Space>
          {
            record.address ? (
              <Link
                href={`/api/proxy/${record.address.host}/${record.address.port}/`}
                passHref
              >
                <a target="_blank">
                  连接
                </a>
              </Link>
            ) : undefined
          }
        </Space>
      ),
    },
  ];
  return (
    <div>
      <FilterFormContainer>
        <Form<FilterForm>
          layout="inline"
          form={form}
          initialValues={query}
          onFinish={async () => {
            setQuery({
              ...await form.validateFields(),
            });
          }}
        >
          <Form.Item label="集群" name="cluster">
            <SingleClusterSelector />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">搜索</Button>
              <Button loading={isLoading} onClick={reload}>刷新</Button>
            </Space>
          </Form.Item>
        </Form>
      </FilterFormContainer>
      <Table
        dataSource={data}
        columns={columns}
        rowKey={(record) => record.sessionId}
        loading={isLoading}
        pagination={false}
      />
    </div>
  );
};

