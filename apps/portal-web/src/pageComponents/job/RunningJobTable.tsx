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

import { getI18nConfigCurrentText } from "@scow/lib-web/build/utils/i18n";
import { App, Button, Form, InputNumber, Popconfirm, Space, Table } from "antd";
import Router from "next/router";
import { join } from "path";
import React, { useCallback, useMemo, useState } from "react";
import { useAsync } from "react-async";
import { useStore } from "simstate";
import { api } from "src/apis";
import { SingleClusterSelector } from "src/components/ClusterSelector";
import { FilterFormContainer } from "src/components/FilterFormContainer";
import { prefix, useI18n, useI18nTranslateToString } from "src/i18n";
import { runningJobId, RunningJobInfo } from "src/models/job";
import { RunningJobDrawer } from "src/pageComponents/job/RunningJobDrawer";
import { DefaultClusterStore } from "src/stores/DefaultClusterStore";
import { Cluster } from "src/utils/config";
interface FilterForm {
  jobId: number | undefined;
  cluster: Cluster;
}

interface Props {
  userId: string;
}

const p = prefix("pageComp.job.runningJobTable.");

export const RunningJobQueryTable: React.FC<Props> = ({
  userId,
}) => {

  const { defaultCluster } = useStore(DefaultClusterStore);

  const [query, setQuery] = useState<FilterForm>(() => {
    return {
      jobId: undefined,
      cluster: defaultCluster,
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

    return filtered.map((x) => RunningJobInfo.fromGrpc(x, query.cluster));
  }, [data, query.jobId]);

  const t = useI18nTranslateToString();

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
          <Form.Item label={t(p("filterForm.cluster"))} name="cluster">
            <SingleClusterSelector />
          </Form.Item>
          <Form.Item label={t(p("filterForm.jobId"))} name="jobId">
            <InputNumber style={{ minWidth: "160px" }} min={1} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">{t("button.searchButton")}</Button>
          </Form.Item>
          <Form.Item>
            <Button loading={isLoading} onClick={reload}>{t("button.refreshButton")}</Button>
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
  const t = useI18nTranslateToString();

  const languageId = useI18n().currentLanguage.id;

  const [previewItem, setPreviewItem] = useState<RunningJobInfo | undefined>(undefined);

  return (
    <>
      <Table
        dataSource={data}
        loading={isLoading}
        pagination={{ showSizeChanger: true }}
        rowKey={runningJobId}
        scroll={{ x: data?.length ? 1950 : true }}
      >
        {
          showCluster && (
            <Table.Column<RunningJobInfo>
              dataIndex="cluster"
              width={150}
              title={t(p("jobInfoTable.cluster"))}
              render={(_, r) => getI18nConfigCurrentText(r.cluster.name, languageId)}
            />
          )
        }
        <Table.Column<RunningJobInfo>
          dataIndex="jobId"
          width={80}
          title={t(p("jobInfoTable.jobId"))}
          sorter={(a, b) => a.jobId.localeCompare(b.jobId)}
        />
        {
          showUser && (
            <Table.Column<RunningJobInfo> dataIndex="user" width={120} title={t(p("jobInfoTable.user"))} />
          )
        }
        {
          showAccount && (
            <Table.Column<RunningJobInfo> dataIndex="account" width={150} title={t(p("jobInfoTable.account"))} />
          )
        }
        <Table.Column<RunningJobInfo>
          dataIndex="name"
          title={t(p("jobInfoTable.name"))}
          width={200}
          ellipsis={true}
        />
        <Table.Column<RunningJobInfo> dataIndex="partition" width={100} title={t(p("jobInfoTable.partition"))} />
        <Table.Column<RunningJobInfo> dataIndex="qos" width={100} title={t(p("jobInfoTable.qos"))} />
        <Table.Column<RunningJobInfo> dataIndex="nodes" width={80} title={t(p("jobInfoTable.nodes"))} />
        <Table.Column<RunningJobInfo> dataIndex="cores" width={80} title={t(p("jobInfoTable.cores"))} />
        <Table.Column<RunningJobInfo> dataIndex="gpus" width={90} title={t(p("jobInfoTable.gpus"))} />
        <Table.Column<RunningJobInfo> dataIndex="state" width={110} title={t(p("jobInfoTable.state"))} />
        <Table.Column
          dataIndex="runningOrQueueTime"
          width={120}
          title={t(p("jobInfoTable.runningOrQueueTime"))}
        />
        <Table.Column<RunningJobInfo>
          dataIndex="nodesOrReason"
          ellipsis={true}
          title={t(p("jobInfoTable.nodesOrReason"))}
          render={(d: string) => d.startsWith("(") && d.endsWith(")") ? d.substring(1, d.length - 1) : d}
        />
        <Table.Column<RunningJobInfo> dataIndex="timeLimit" width={120} title={t(p("jobInfoTable.timeLimit"))} />
        <Table.Column<RunningJobInfo>
          title={t(p("jobInfoTable.more"))}
          width={180}
          render={(_, r) => (
            <Space>
              <a onClick={() => Router.push(join("/files", r.cluster.id, r.workingDir))}>
                {t(p("jobInfoTable.linkToPath"))}
              </a>
              <a onClick={() => setPreviewItem(r)}>{t("button.detailButton")}</a>
              <Popconfirm
                title={t(p("jobInfoTable.popConfirm"))}
                onConfirm={async () =>
                  api.cancelJob({ query: {
                    cluster: r.cluster.id,
                    jobId: +r.jobId,
                  } })
                    .then(() => {
                      message.success(t(p("jobInfoTable.successMessage")));
                      reload();
                    })
                }
              >
                <a>{t("button.finishButton")}</a>
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


