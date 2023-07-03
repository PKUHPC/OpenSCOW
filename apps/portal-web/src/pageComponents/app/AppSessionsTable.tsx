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

import { ExclamationCircleOutlined } from "@ant-design/icons";
import { compareDateTime, formatDateTime } from "@scow/lib-web/build/utils/datetime";
import { compareNumber } from "@scow/lib-web/build/utils/math";
import type { AppSession } from "@scow/protos/build/portal/app";
import { App, Button, Checkbox, Form, Input, Popconfirm, Space, Table, TableColumnsType, Tooltip } from "antd";
import type { CheckboxChangeEvent } from "antd/es/checkbox";
import { useRouter } from "next/router";
import { join } from "path";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAsync } from "react-async";
import { api } from "src/apis";
import { FilterFormContainer } from "src/components/FilterFormContainer";
import { calculateAppRemainingTime, compareState } from "src/models/job";
import { ConnectTopAppLink } from "src/pageComponents/app/ConnectToAppLink";
import { Cluster } from "src/utils/config";

interface FilterForm {
 appJobName: string | undefined
}

interface Props {
  cluster: Cluster;
}

export const AppSessionsTable: React.FC<Props> = ({ cluster }) => {

  const [query, setQuery] = useState<FilterForm>(() => {
    return { appJobName: undefined };
  });
  const [form] = Form.useForm<FilterForm>();


  const { message } = App.useApp();

  const router = useRouter();

  const [connectivityRefreshToken, setConnectivityRefreshToken] = useState(false);

  const [onlyNotEnded, setOnlyNotEnded] = useState(false);

  const { data, isLoading, reload } = useAsync({
    promiseFn: useCallback(async () => {
      // List all desktop
      const { sessions } = await api.getAppSessions({ query: { cluster: cluster.id } });

      return sessions.map((x) => ({
        ...x,
        remainingTime: x.state === "RUNNING" ? calculateAppRemainingTime(x.runningTime, x.timeLimit) : x.timeLimit,
      }));

    }, []),
  });

  const filteredData = useMemo(() => {
    if (!data) { return undefined; }

    let filtered = data;
    if (query.appJobName) {
      filtered = filtered.filter((x) => x.sessionId.toLowerCase().includes(query.appJobName!.toLowerCase()));
    }

    return filtered;
  }, [data, query.appJobName]);


  const columns: TableColumnsType<AppSession> = [
    {
      title: "应用名",
      dataIndex: "sessionId",
    },
    {
      title: "作业ID",
      dataIndex: "jobId",
      sorter: (a, b) => compareNumber(a.jobId, b.jobId),
    },
    {
      title: "应用",
      dataIndex: "appId",
      render: (appId: string, record) => record.appName ?? appId,
      sorter: (a, b) => (!a.submitTime || !b.submitTime) ? -1 : compareDateTime(a.submitTime, b.submitTime),
    },
    {
      title: "提交时间",
      dataIndex: "submitTime",
      render: (_, record) => record.submitTime ? formatDateTime(record.submitTime) : "",
    },
    {
      title: "状态",
      dataIndex: "state",
      render: (_, record) => (
        record.reason ? (
          <Tooltip title={record.reason}>
            <Space>
              {record.state}
              <ExclamationCircleOutlined />
            </Space>
          </Tooltip>
        ) : (
          <span>{record.state}</span>
        )
      ),
      sorter: (a, b) => compareState (a.state, b.state)
        ? compareState (a.state, b.state) :
        compareNumber(a.jobId, b.jobId),
      defaultSortOrder: "descend",

    },
    {
      title: "剩余时间",
      dataIndex: "remainingTime",
    },

    {
      title: "操作",
      key: "action",
      width: "20%",
      render: (_, record) => (
        <Space>
          {
            (record.state === "RUNNING") ? (
              <>
                <ConnectTopAppLink
                  session={record}
                  cluster={cluster}
                  refreshToken={connectivityRefreshToken}
                />
                <Popconfirm
                  title="确定结束这个任务吗？"
                  onConfirm={async () =>
                    api.cancelJob({ query: {
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
          {
            (record.state === "PENDING" || record.state === "SUSPENDED") ? (
              <Popconfirm
                title="确定取消这个任务吗？"
                onConfirm={async () =>
                  api.cancelJob({ query: {
                    cluster: cluster.id,
                    jobId: record.jobId,
                  } })
                    .then(() => {
                      message.success("任务取消请求已经提交！");
                      reload();
                    })
                }
              >
                <a>取消</a>
              </Popconfirm>
            ) : undefined
          }
          <a onClick={() => {
            router.push(join("/files", cluster.id, record.dataPath));
          }}
          >
            进入目录
          </a>
        </Space>
      ),
    },
  ];

  const [checked, setChecked] = useState(true);
  const [disabled] = useState(false);

  const reloadTable = useCallback(() => {
    reload();
    setConnectivityRefreshToken((f) => !f);
  }, [reload, setConnectivityRefreshToken]);

  const onChange = (e: CheckboxChangeEvent) => {
    setChecked(e.target.checked);
  };

  useEffect(() => {
    if (checked) {
      const interval = setInterval(() => {
        reloadTable();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [reload, checked]);

  useEffect(() => {
    reloadTable();
  }, [query]);

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
            reload();
          }}
        >
          <Form.Item label="应用名" name="appJobName">
            <Input style={{ minWidth: "160px" }} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">搜索</Button>
            </Space>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button loading={isLoading} onClick={reload}>刷新</Button>
            </Space>
          </Form.Item>
          <Form.Item>
            <Checkbox
              checked={checked}
              disabled={disabled}
              onChange={onChange}
            >
              10s自动刷新
            </Checkbox>
          </Form.Item>
          <Form.Item>
            <Checkbox
              checked={onlyNotEnded}
              onChange={(e) => setOnlyNotEnded(e.target.checked)}
            >
              只展示未结束的作业
            </Checkbox>
          </Form.Item>
        </Form>
      </FilterFormContainer>
      <Table
        dataSource={onlyNotEnded ? filteredData?.filter((x) => x.state !== "ENDED") : filteredData}
        columns={columns}
        rowKey={(record) => record.sessionId}
        loading={!filteredData && isLoading}
      />
    </div>
  );
};

