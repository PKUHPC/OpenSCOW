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
import { prefix, useI18nTranslateToString } from "src/i18n";
import { calculateAppRemainingTime, compareState } from "src/models/job";
import { ConnectTopAppLink } from "src/pageComponents/app/ConnectToAppLink";
import { Cluster } from "src/utils/config";

interface FilterForm {
 appJobName: string | undefined
}

interface Props {
  cluster: Cluster;
}

const p = prefix("pageComp.app.appSessionTable.");

export const AppSessionsTable: React.FC<Props> = ({ cluster }) => {

  const [query, setQuery] = useState<FilterForm>(() => {
    return { appJobName: undefined };
  });
  const [form] = Form.useForm<FilterForm>();

  const t = useI18nTranslateToString();

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
        remainingTime: x.state === "RUNNING" ? calculateAppRemainingTime(x.runningTime, x.timeLimit) :
          x.state === "PENDING" ? "" : x.timeLimit,
      }));

    }, [cluster]),
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
      title: t(p("table.sessionId")),
      dataIndex: "sessionId",
      width:"30%",
    },
    {
      title: t(p("table.jobId")),
      dataIndex: "jobId",
      sorter: (a, b) => compareNumber(a.jobId, b.jobId),
    },
    {
      title: t(p("table.appId")),
      dataIndex: "appId",
      render: (appId: string, record) => record.appName ?? appId,
      sorter: (a, b) => (!a.submitTime || !b.submitTime) ? -1 : compareDateTime(a.submitTime, b.submitTime),
    },
    {
      title: t(p("table.submitTime")),
      dataIndex: "submitTime",
      render: (_, record) => record.submitTime ? formatDateTime(record.submitTime) : "",
    },
    {
      title: t(p("table.state")),
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
      title: t(p("table.remainingTime")),
      dataIndex: "remainingTime",
    },

    {
      title: t("button.actionButton"),
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
                  title={t(p("table.popFinishConfirmTitle"))}
                  onConfirm={async () =>
                    api.cancelJob({ query: {
                      cluster: cluster.id,
                      jobId: record.jobId,
                    } })
                      .then(() => {
                        message.success(t(p("table.popFinishConfirmMessage")));
                        reload();
                      })
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
                title={t(p("table.popCancelConfirmTitle"))}
                onConfirm={async () =>
                  api.cancelJob({ query: {
                    cluster: cluster.id,
                    jobId: record.jobId,
                  } })
                    .then(() => {
                      message.success(t(p("table.popCancelConfirmMessage")));
                      reload();
                    })
                }
              >
                <a>{t("button.cancelButton")}</a>
              </Popconfirm>
            ) : undefined
          }
          <a onClick={() => {
            router.push(join("/files", cluster.id, record.dataPath));
          }}
          >
            {t(p("table.linkToPath"))}
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
          <Form.Item label={t(p("filterForm.appJobName"))} name="appJobName">
            <Input style={{ minWidth: "160px" }} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">{t("button.searchButton")}</Button>
            </Space>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button loading={isLoading} onClick={reload}>{t("button.refreshButton")}</Button>
            </Space>
          </Form.Item>
          <Form.Item>
            <Checkbox
              checked={checked}
              disabled={disabled}
              onChange={onChange}
            >
              {t(p("filterForm.autoRefresh"))}
            </Checkbox>
          </Form.Item>
          <Form.Item>
            <Checkbox
              checked={onlyNotEnded}
              onChange={(e) => setOnlyNotEnded(e.target.checked)}
            >
              {t(p("filterForm.onlyNotEnded"))}
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

