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
import { App, Button, Checkbox, Form, Input, Popconfirm, Space, Table, TableColumnsType, Tooltip } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { join } from "path";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FilterFormContainer } from "src/components/FilterFormContainer";
import { ModalButton } from "src/components/ModalLink";
import { prefix, useI18nTranslateToString } from "src/i18n";
import { JobType } from "src/models/Job";
import { Cluster } from "src/server/trpc/route/config";
import { AppSession } from "src/server/trpc/route/jobs/apps";
import { calculateAppRemainingTime, compareDateTime, formatDateTime } from "src/utils/datetime";
import { compareNumber } from "src/utils/math";
import { parseBooleanParam } from "src/utils/parse";
import { trpc } from "src/utils/trpc";

import { ConnectTopAppLink } from "./ConnectToAppLink";
import { SaveImageModal } from "./SaveImageModal";

interface FilterForm {
  appJobName: string | undefined
}

export enum AppTableStatus {
  UNFINISHED = "UNFINISHED",
  FINISHED = "FINISHED",
}

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

const SaveImageModalButton = ModalButton(SaveImageModal, { type: "link" });

export const AppSessionsTable: React.FC<Props> = ({ cluster, status }) => {
  const t = useI18nTranslateToString();
  const p = prefix("app.jobs.appSessionsTable.");

  const router = useRouter();
  const { message } = App.useApp();

  const unfinished = status === AppTableStatus.UNFINISHED;

  const [query, setQuery] = useState<FilterForm>(() => {
    return { appJobName: undefined };
  });
  const [form] = Form.useForm<FilterForm>();

  const [checked, setChecked] = useState(true);
  const [connectivityRefreshToken, setConnectivityRefreshToken] = useState(false);

  const { data, refetch, isLoading, isFetching } = trpc.jobs.listAppSessions.useQuery({
    clusterId: cluster.id, isRunning: parseBooleanParam(unfinished),
  });

  const cancelJobMutation = trpc.jobs.cancelJob.useMutation({
    onError:(e) => {
      message.error(`${t(p("operateFailed"))}: ${e.message}`);
    },
    onSuccess: () => {
      refetch();
    },
  });

  const columns: TableColumnsType<AppSession> = [
    {
      title: t(p("jobId")),
      dataIndex: "jobId",
      width: "8%",
      defaultSortOrder: "descend",
      sorter: (a, b) => compareNumber(a.jobId, b.jobId),
    },
    {
      title: t(p("jobName")),
      dataIndex: "jobName",
      width: "25%",
      ellipsis: true,
    },
    {
      title: t(p("servicePort")),
      dataIndex: "servicePort",
      width: "10%",
      ellipsis: true,
      render: (_, record) => {
        if (record.jobType === JobType.INFER) {
          return record.port;
        }
      },
    },
    {
      title: t(p("jobType")),
      dataIndex: "jobType",
      width: "8%",
      render: (_, record) => {
        if (record.jobType === JobType.APP) {
          return t(p("app"));
        }
        else if (record.jobType === JobType.TRAIN) {
          return t(p("train"));
        }
        return t(p("infer"));
      },
    },
    {
      title: t(p("app")),
      dataIndex: "appId",
      width: "8%",
      render: (appId: string, record) => record.appName ?? appId,
      sorter: (a, b) => (!a.submitTime || !b.submitTime) ? -1 : compareDateTime(a.submitTime, b.submitTime),
    },
    {
      title: t(p("submitTime")),
      dataIndex: "submitTime",
      width: "200px",
      render: (_, record) => record.submitTime ? formatDateTime(record.submitTime) : "",
    },
    {
      title: t(p("state")),
      dataIndex: "state",
      width: "120px",
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
      title: t(p("remainingTime")),
      width: "120px",
      dataIndex: "remainingTime",
    },
    ] : []),
    {
      title: t(p("action")),
      key: "action",
      fixed:"right",
      width: "550px",
      render: (_, record) => (
        <Space>
          {
            (record.state === "RUNNING") ? (
              <>
                {record.jobType === JobType.APP && (
                  <ConnectTopAppLink
                    session={record}
                    cluster={cluster.id}
                    refreshToken={connectivityRefreshToken}
                  />
                )}
                <Link href={`/jobShell/${cluster.id}/${record.jobId}`} target="_blank">
                  {t(p("enterContainer"))}
                </Link>
                <Popconfirm
                  title={t(p("confirmFinish"))}
                  onConfirm={
                    async () => {
                      await cancelJobMutation.mutateAsync({
                        cluster: cluster.id,
                        jobId: record.jobId,
                      });
                      message.success(t(p("jobFinishReq")));
                    }
                  }
                >
                  <a>{t("button.finishButton")}</a>
                </Popconfirm>
              </>
            ) : undefined
          }
          {
            (record.state === "PENDING" || record.state === "SUSPENDED") ? (
              <Popconfirm
                title={t(p("confirmCancel"))}
                onConfirm={
                  async () => {
                    await cancelJobMutation.mutateAsync({
                      cluster: cluster.id,
                      jobId: record.jobId,
                    });
                    message.success(t(p("jobCancelReq")));
                  }
                }
              >
                <a>{t("button.cancelButton")}</a>
              </Popconfirm>
            ) : undefined
          }
          {
            (record.state === "RUNNING" && record.jobType === JobType.APP) ? (
              <SaveImageModalButton
                reload={refetch}
                appSession={record}
                clusterId={cluster.id}
              >{t(p("saveImage"))}</SaveImageModalButton>
            ) : undefined
          }
          <Button
            type="link"
            onClick={async () => {
              let basePath = `/jobs/${cluster.id}`;
              const searchParams = new URLSearchParams({
                jobId:  record.jobId.toString(),
                sessionId: record.sessionId,
              });

              if (record.jobType === JobType.APP) {
                if (record.appId) {
                  basePath += `/createApps/${record.appId}`;
                }
              } else if (record.jobType === JobType.TRAIN) {
                basePath += "/trainJobs";
              } else if (record.jobType === JobType.INFER) {
                basePath += "/inference";
              }
              router.push(`${basePath}?${searchParams.toString()}`);
            }}
          >{t(p("submitAgain"))}</Button>
          <a onClick={() => {
            router.push(join("/files", cluster.id, record.dataPath));
          }}
          >
            {t(p("enterDir"))}
          </a>
        </Space>
      ),
    },
  ];


  const reloadTable = useCallback(() => {
    refetch();
    setConnectivityRefreshToken((f) => !f);
  }, [setConnectivityRefreshToken]);

  useEffect(() => {
    if (checked && unfinished) {
      const interval = setInterval(() => {
        reloadTable();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [checked, unfinished]);

  const filteredData = useMemo(() => {
    if (!data) { return []; }

    return data.sessions.filter((x) => {
      if (query.appJobName) {
        // 之前的作业只有sessionId，没有存jobName
        const jobName = x.jobName ? x.jobName : x.sessionId;
        return jobName.toLowerCase().includes(query.appJobName.toLowerCase());
      }
      return true;
    }).map((x) =>
      ({
        ...x,
        jobName:x.jobName ? x.jobName : x.sessionId,
        remainingTime: x.state === "RUNNING" ? calculateAppRemainingTime(x.runningTime, x.timeLimit) :
          x.state === "PENDING" ? "" : x.timeLimit,
      }),
    );

  }, [data, query]);

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
          <Form.Item label={t(p("jobName"))} name="appJobName">
            <Input style={{ minWidth: "160px" }} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">{t("button.searchButton")}</Button>
            </Space>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button loading={isLoading} onClick={() => refetch()}>{t("button.refreshButton")}</Button>
            </Space>
          </Form.Item>
          {unfinished && (
            <Form.Item>
              <Checkbox
                checked={checked}
                onChange={(e) => { setChecked(e.target.checked); }}
              >
                10s{t(p("autoRefresh"))}
              </Checkbox>
            </Form.Item>
          ) }
        </Form>
      </FilterFormContainer>
      <Table
        tableLayout="fixed"
        dataSource={filteredData}
        columns={columns}
        rowKey={(record) => record.sessionId}
        loading={isLoading || isFetching}
        scroll={{ x:true }}
        pagination={{
          showSizeChanger: true,
          defaultPageSize: 50,
        }}
      />
    </>
  );
};
