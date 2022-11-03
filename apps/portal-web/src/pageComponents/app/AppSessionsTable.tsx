import { Button, Form, message, Popconfirm, Space, Table, TableColumnsType } from "antd";
import Router from "next/router";
import { join } from "path";
import React, { useCallback, useState } from "react";
import { useAsync } from "react-async";
import { api } from "src/apis";
import { SingleClusterSelector } from "src/components/ClusterSelector";
import { FilterFormContainer } from "src/components/FilterFormContainer";
import type { AppSession } from "src/generated/portal/app";
import { ConnectTopAppLink } from "src/pageComponents/app/ConnectToAppLink";
import { Cluster, publicConfig } from "src/utils/config";
import { compareDateTime, formatDateTime } from "src/utils/datetime";
import { compareNumber } from "src/utils/math";

interface Props {
}

interface FilterForm {
  cluster: Cluster;
}


export const AppSessionsTable: React.FC<Props> = () => {

  const [form] = Form.useForm<FilterForm>();

  const [query, setQuery] = useState<FilterForm>(() => {
    return {
      cluster: publicConfig.CLUSTERS[0],
    };
  });

  const { data, isLoading, reload } = useAsync({
    promiseFn: useCallback(async () => {
      // List all desktop
      const { sessions } = await api.getAppSessions({ query: { cluster: query.cluster.id } });

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
      sorter: (a, b) => compareNumber(a.jobId, b.jobId),
      defaultSortOrder: "descend",
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
      sorter: (a, b) => (!a.submitTime || !b.submitTime) ? -1 : compareDateTime(a.submitTime, b.submitTime),
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
            (record.ready) ? (
              <>
                <ConnectTopAppLink
                  session={record}
                  cluster={query.cluster}
                />
                <Popconfirm
                  title="确定结束这个任务吗？"
                  onConfirm={async () =>
                    api.cancelJob({ body: {
                      cluster: query.cluster.id,
                      jobId: record.jobId,
                    } })
                      .then(() => {
                        message.success("任务结束请求已经提交！");
                        reload();
                      })
                  }
                >
                  <a>结束</a>
                </Popconfirm>
              </>
            ) : undefined
          }
          <a onClick={() => {
            Router.push(join("/files", query.cluster.id, record.dataPath));
          }}
          >
            进入目录
          </a>
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
              ...(await form.validateFields()),
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
      />
    </div>
  );
};

