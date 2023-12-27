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

"use client";

import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Button, Checkbox, Form, Input, Space, Table, TableColumnsType, Tooltip } from "antd";
import React, { useCallback, useEffect, useState } from "react";
import { FilterFormContainer } from "src/components/FilterFormContainer";
import { Cluster } from "src/server/trpc/route/config";
import { AppSession } from "src/server/trpc/route/jobs/apps";
import { compareDateTime, formatDateTime } from "src/utils/datetime";
import { compareNumber } from "src/utils/math";
import { trpc } from "src/utils/trpc";

interface FilterForm {
  appJobName: string | undefined
 }

type AppTableStatus = "UNFINISHED" | "FINISHED"

interface Props {
  cluster: Cluster
  status: AppTableStatus
}

export function compareState(a: string, b: string): -1 | 0 | 1 {
  const endState = "ENDED";
  if (a === b || (a !== endState && b !== endState)) { return 0; }
  if (a === endState) { return -1; }
  return 1;
}

export const AppSessionsTable: React.FC<Props> = ({ cluster, status }) => {

  const unfinished = status === "UNFINISHED";

  const [query, setQuery] = useState<FilterForm>(() => {
    return { appJobName: undefined };
  });
  const [form] = Form.useForm<FilterForm>();

  const [checked, setChecked] = useState(true);
  const [connectivityRefreshToken, setConnectivityRefreshToken] = useState(false);

  const { data, refetch, isLoading, isFetching } = trpc.jobs.listAppSessions.useQuery({
    clusterId: cluster.id, isRunning: true,
  });

  const columns: TableColumnsType<any> = [
    {
      title: "作业名",
      dataIndex: "sessionId",
      width: "25%",
      ellipsis: true,
    },
    {
      title: "作业ID",
      dataIndex: "jobId",
      width: "8%",
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
      width: "15%",
      render: (_, record) => record.submitTime ? formatDateTime(record.submitTime) : "",
    },
    {
      title: "状态",
      dataIndex: "state",
      width: "12%",
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
    ...(unfinished ? [{
      title: "剩余时间",
      dataIndex: "remainingTime",
    },
    ] : []),
    {
      title: "操作",
      key: "action",
      fixed:"right",
      width: "10%",
      // render: (_, record) => (
      // <Space>
      //   {
      //     (record.state === "RUNNING") ? (
      //       <>
      //         <ConnectTopAppLink
      //           session={record}
      //           cluster={cluster}
      //           refreshToken={connectivityRefreshToken}
      //         />
      //         <Popconfirm
      //           title={t(p("table.popFinishConfirmTitle"))}
      //           onConfirm={async () =>
      //             api.cancelJob({ query: {
      //               cluster: cluster.id,
      //               jobId: record.jobId,
      //             } })
      //               .then(() => {
      //                 message.success(t(p("table.popFinishConfirmMessage")));
      //                 reload();
      //               })
      //           }
      //         >
      //           <a>{t("button.finishButton")}</a>
      //         </Popconfirm>
      //       </>
      //     ) : undefined
      //   }
      //   {
      //     (record.state === "PENDING" || record.state === "SUSPENDED") ? (
      //       <Popconfirm
      //         title={t(p("table.popCancelConfirmTitle"))}
      //         onConfirm={async () =>
      //           api.cancelJob({ query: {
      //             cluster: cluster.id,
      //             jobId: record.jobId,
      //           } })
      //             .then(() => {
      //               message.success(t(p("table.popCancelConfirmMessage")));
      //               reload();
      //             })
      //         }
      //       >
      //         <a>{t("button.cancelButton")}</a>
      //       </Popconfirm>
      //     ) : undefined
      //   }
      //   <a onClick={() => {
      //     router.push(join("/files", cluster.id, record.dataPath));
      //   }}
      //   >
      //     {t(p("table.linkToPath"))}
      //   </a>
      // </Space>
      // ),
    },
  ];


  const reloadTable = useCallback(() => {
    refetch();
    setConnectivityRefreshToken((f) => !f);
  }, [setConnectivityRefreshToken]);

  useEffect(() => {
    if (checked) {
      const interval = setInterval(() => {
        reloadTable();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [checked]);

  return (
    <>
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
          <Form.Item label="作业名" name="appJobName">
            <Input style={{ minWidth: "160px" }} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">搜索</Button>
            </Space>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button loading={isLoading} onClick={() => refetch()}>刷新</Button>
              <Button>刷新</Button>
            </Space>
          </Form.Item>
          {unfinished && (
            <Form.Item>
              <Checkbox
                checked={checked}
                onChange={(e) => { setChecked(e.target.checked); }}
              >
              10s自动刷新
              </Checkbox>
            </Form.Item>
          ) }
        </Form>
      </FilterFormContainer>
      <Table
        tableLayout="fixed"
        dataSource={data?.sessions || []}
        columns={columns}
        rowKey={(record) => record.sessionId}
        // loading={!filteredData && isLoading}
        // scroll={{ x: filteredData?.length ? 1200 : true }}
        pagination={{
          showSizeChanger: true,
          defaultPageSize: 50,
        }}
      />
    </>
  );
};
