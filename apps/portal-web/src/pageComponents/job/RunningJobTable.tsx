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

import { App, Button, Form, InputNumber, Popconfirm, Space, Table } from "antd";
import Router from "next/router";
import { join } from "path";
import React, { useCallback, useMemo, useState } from "react";
import { useAsync } from "react-async";
import { useStore } from "simstate";
import { api } from "src/apis";
import { SingleClusterSelector } from "src/components/ClusterSelector";
import { FilterFormContainer } from "src/components/FilterFormContainer";
import { runningJobId, RunningJobInfo } from "src/models/job";
import { RunningJobDrawer } from "src/pageComponents/job/RunningJobDrawer";
import { DefaultClusterStore } from "src/stores/DefaultClusterStore";
import { Cluster, clusterConfigToCluster } from "src/utils/config";

interface FilterForm {
  jobId: number | undefined;
  cluster: Cluster;
}

interface Props {
  userId: string;
}




export const RunningJobQueryTable: React.FC<Props> = ({
  userId,
}) => {

  const defaultClusterStore = useStore(DefaultClusterStore);

  const [query, setQuery] = useState<FilterForm>(() => {
    return {
      jobId: undefined,
      cluster: defaultClusterStore.cluster,
    };
  });

  const [form] = Form.useForm<FilterForm>();

  const promiseFn = useCallback(async () => {
    return await api.getRunningJobs({ query: {
      userId: userId,
      cluster: query.cluster.id,
    } });
  }, [userId, query.cluster]);

  const { data, isLoading, reload } = useAsync({ promiseFn });

  const filteredData = useMemo(() => {
    if (!data) { return undefined; }

    let filtered = data.results;
    if (query.jobId) {
      filtered = filtered.filter((x) => x.jobId === query.jobId + "");
    }

    return filtered.map((x) => RunningJobInfo.fromGrpc(x, clusterConfigToCluster(query.cluster.id)!));
  }, [data, query.jobId]);

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
          <Form.Item label="集群作业ID" name="jobId">
            <InputNumber style={{ minWidth: "160px" }} min={1} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">搜索</Button>
          </Form.Item>
          <Form.Item>
            <Button loading={isLoading} onClick={reload}>刷新</Button>
          </Form.Item>
        </Form>
      </FilterFormContainer>
      <RunningJobInfoTable
        data={filteredData}
        isLoading={isLoading}
        showAccount={true}
        showUser={true}
        showCluster={false}
        reload={reload}
      />
    </div>
  );
};

type JobInfoTableProps = {
  data: RunningJobInfo[] | undefined;
  isLoading: boolean;
  showAccount: boolean;
  showCluster: boolean;
  showUser: boolean;
  reload: () => void;
};

export const RunningJobInfoTable: React.FC<JobInfoTableProps> = ({
  data, isLoading, showAccount, showCluster, showUser, reload,
}) => {

  const { message } = App.useApp();


  const [previewItem, setPreviewItem] = useState<RunningJobInfo | undefined>(undefined);

  return (
    <>
      <Table
        dataSource={data}
        loading={isLoading}
        pagination={{ showSizeChanger: true }}
        rowKey={runningJobId}
        scroll={{ x: true }}
      >
        {
          showCluster && (
            <Table.Column<RunningJobInfo>
              dataIndex="cluster"
              title="集群"
              render={(_, r) => r.cluster.name}
            />
          )
        }
        <Table.Column<RunningJobInfo>
          dataIndex="jobId"
          title="作业ID"
          sorter={(a, b) => a.jobId.localeCompare(b.jobId)}
        />
        {
          showUser && (
            <Table.Column<RunningJobInfo> dataIndex="user" title="用户" />
          )
        }
        {
          showAccount && (
            <Table.Column<RunningJobInfo> dataIndex="account" title="账户" />
          )
        }
        <Table.Column<RunningJobInfo> dataIndex="name" title="作业名" />
        <Table.Column<RunningJobInfo> dataIndex="partition" title="分区" />
        <Table.Column<RunningJobInfo> dataIndex="qos" title="QOS" />
        <Table.Column<RunningJobInfo> dataIndex="nodes" title="节点数" />
        <Table.Column<RunningJobInfo> dataIndex="cores" title="核心数" />
        <Table.Column<RunningJobInfo> dataIndex="state" title="状态" />
        <Table.Column
          dataIndex="runningOrQueueTime"
          title="运行/排队时间"
        />
        <Table.Column<RunningJobInfo>
          dataIndex="nodesOrReason"
          title="说明"
          render={(d: string) => d.startsWith("(") && d.endsWith(")") ? d.substring(1, d.length - 1) : d}
        />
        <Table.Column<RunningJobInfo> dataIndex="timeLimit" title="作业时间限制" />
        <Table.Column<RunningJobInfo>
          title="更多"
          render={(_, r) => (
            <Space>
              <a onClick={() => Router.push(join("/files", r.cluster.id, r.workingDir))}>
                进入目录
              </a>
              <a onClick={() => setPreviewItem(r)}>详情</a>
              <Popconfirm
                title="确定结束这个任务吗？"
                onConfirm={async () =>
                  api.cancelJob({ body: {
                    cluster: r.cluster.id,
                    jobId: +r.jobId,
                  } })
                    .then(() => {
                      message.success("任务结束请求已经提交！");
                      reload();
                    })
                }
              >
                <a>结束</a>
              </Popconfirm>
            </Space>
          )}
        />
      </Table>
      <RunningJobDrawer
        open={previewItem !== undefined}
        item={previewItem}
        onClose={() => setPreviewItem(undefined)}
      />
    </>
  );
};


