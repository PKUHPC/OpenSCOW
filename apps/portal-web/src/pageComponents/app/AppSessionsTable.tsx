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

import { Button, Form, Popconfirm, Space, Table, TableColumnsType } from "antd";
import Router, { useRouter } from "next/router";
import { join } from "path";
import React, { useCallback } from "react";
import { useAsync } from "react-async";
import { useStore } from "simstate";
import { api } from "src/apis";
import { SingleClusterSelector } from "src/components/ClusterSelector";
import { FilterFormContainer } from "src/components/FilterFormContainer";
import type { AppSession } from "src/generated/portal/app";
import { useMessage } from "src/layouts/prompts";
import { ConnectTopAppLink } from "src/pageComponents/app/ConnectToAppLink";
import { AppsStore } from "src/stores/AppsStore";
import { DefaultClusterStore } from "src/stores/DefaultClusterStore";
import { publicConfig } from "src/utils/config";
import { compareDateTime, formatDateTime } from "src/utils/datetime";
import { compareNumber } from "src/utils/math";
import { queryToString } from "src/utils/querystring";

interface Props {
}

export const AppSessionsTable: React.FC<Props> = () => {

  const apps = useStore(AppsStore);

  const message = useMessage();

  const router = useRouter();

  const clusterQuery = queryToString(router.query.cluster);

  const defaultClusterStore = useStore(DefaultClusterStore);

  const cluster = publicConfig.CLUSTERS.find((x) => x.id === clusterQuery) ?? defaultClusterStore.cluster;

  const { data, isLoading, reload } = useAsync({
    promiseFn: useCallback(async () => {
      // List all desktop
      const { sessions } = await api.getAppSessions({ query: { cluster: cluster.id } });

      return sessions;

    }, [cluster]),
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
      render: (appId: string) => apps.find((x) => x.id === appId)?.name ?? appId,
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
                  cluster={cluster}
                />
                <Popconfirm
                  title="确定结束这个任务吗？"
                  onConfirm={async () =>
                    api.cancelJob({ body: {
                      cluster: cluster.id,
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
            Router.push(join("/files", cluster.id, record.dataPath));
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
        <Form layout="inline">
          <Form.Item label="集群">
            <SingleClusterSelector
              value={cluster}
              onChange={(cluster) => {
                router.push({ pathname: router.pathname, query: { cluster: cluster.id } });
              }}
            />
          </Form.Item>
          <Form.Item>
            <Space>
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

