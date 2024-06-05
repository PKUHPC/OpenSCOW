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

import { useDidUpdateEffect } from "@scow/lib-web/build/utils/hooks";
import { compareTimeAsSeconds } from "@scow/lib-web/build/utils/math";
import { DEFAULT_PAGE_SIZE } from "@scow/lib-web/build/utils/pagination";
import { getI18nConfigCurrentText } from "@scow/lib-web/build/utils/systemLanguage";
import { Button, Form, Input, InputNumber, message, Popconfirm, Select, Space, Table } from "antd";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { useAsync } from "react-async";
import { useStore } from "simstate";
import { api } from "src/apis";
import { SingleClusterSelector } from "src/components/ClusterSelector";
import { ClusterNotAvailablePage } from "src/components/errorPages/ClusterNotAvailablePage";
import { FilterFormContainer, FilterFormTabs } from "src/components/FilterFormContainer";
import { ModalLink } from "src/components/ModalLink";
import { TableTitle } from "src/components/TableTitle";
import { prefix, useI18n, useI18nTranslateToString } from "src/i18n";
import { runningJobId, RunningJobInfo } from "src/models/job";
import { BatchChangeJobTimeLimitButton } from "src/pageComponents/job/BatchChangeJobTimeLimitButton";
import { ChangeJobTimeLimitModal } from "src/pageComponents/job/ChangeJobTimeLimitModal";
import { RunningJobDrawer } from "src/pageComponents/job/RunningJobDrawer";
import { ClusterInfoStore } from "src/stores/ClusterInfoStore";
import type { Cluster } from "src/utils/cluster";
import { publicConfig } from "src/utils/config";


interface FilterForm {
  jobId: number | undefined;
  cluster: Cluster;
  accountName?: string;
}

interface Props {
  userId?: string;
  accountNames?: string[] | string;
  filterAccountName?: boolean;
  showAccount: boolean;
  showUser: boolean;
}


const p = prefix("pageComp.job.runningJobTable.");
const pCommon = prefix("common.");

export const RunningJobQueryTable: React.FC<Props> = ({
  userId, accountNames, showUser, showAccount, filterAccountName = true,
}) => {

  const t = useI18nTranslateToString();

  const searchType = useRef<"precision" | "range">("range");

  const [selected, setSelected] = useState<RunningJobInfo[]>([]);

  const { activatedClusters, defaultCluster } = useStore(ClusterInfoStore);

  if (!defaultCluster && Object.keys(activatedClusters).length === 0) {
    return <ClusterNotAvailablePage />;
  }

  const [query, setQuery] = useState<FilterForm>(() => {
    return {
      accountName: typeof accountNames === "string" ? accountNames : undefined,
      jobId: undefined,
      cluster: defaultCluster ?? Object.values(activatedClusters)[0],
    };
  });

  useDidUpdateEffect(() => {
    setQuery((q) => ({
      ...q,
      accountName: Array.isArray(accountNames) ? accountNames[0] : accountNames ? accountNames : undefined,
    }));
  }, [accountNames]);

  const [form] = Form.useForm<FilterForm>();

  const promiseFn = useCallback(async () => {

    const diffAccountNameQuery = searchType.current === "precision" ? {
      accountName : Array.isArray(accountNames) ? undefined : accountNames,
    } : {
      accountName: query.accountName || undefined,
    };

    return await api.getRunningJobs({ query: {
      userId: userId || undefined,
      cluster: query.cluster.id,
      ...diffAccountNameQuery,
    } });
  }, [userId, searchType.current, query.cluster, query.accountName, query.jobId]);

  const { data, isLoading, reload } = useAsync({ promiseFn });

  const filteredData = useMemo(() => {
    if (!data) { return undefined; }

    let filtered = data.results;
    if (searchType.current === "precision" && query.jobId) {
      filtered = filtered.filter((x) => x.jobId === query.jobId + "");
    } else {
      // add local range filters here
    }

    return filtered.map((x) => RunningJobInfo.fromGrpc(x, activatedClusters[query.cluster.id]));
  }, [data, query.jobId]);

  return (
    <div>
      <FilterFormContainer>
        <Form
          form={form}
          initialValues={query}
          onFinish={async () => {
            setQuery({
              accountName: query.accountName,
              ...(await form.validateFields()),
            });
          }}
        >
          <FilterFormTabs
            onChange={(key: "range" | "precision") => {
              searchType.current = key;
            }}
            button={(
              <Space>
                <Button type="primary" htmlType="submit">{t(pCommon("search"))}</Button>
                <Button onClick={reload} loading={isLoading}>{t(pCommon("fresh"))}</Button>
              </Space>
            )}
            tabs={[
              {
                title: t(p("batch")),
                key: "range",
                node: (
                  <>
                    <Form.Item label={t(pCommon("cluster"))} name="cluster">
                      <SingleClusterSelector />
                    </Form.Item>
                    {
                      filterAccountName
                        ? accountNames
                          ? (
                            <Form.Item label={t(pCommon("account"))} name="accountName">
                              <Select style={{ minWidth: 96 }} allowClear>
                                {(Array.isArray(accountNames) ? accountNames : [accountNames]).map((x) => (
                                  <Select.Option key={x} value={x}>{x}</Select.Option>
                                ))}
                              </Select>
                            </Form.Item>
                          ) : (
                            <Form.Item label={t(pCommon("account"))} name="accountName">
                              <Input />
                            </Form.Item>
                          )
                        : undefined
                    }
                  </>
                ),

              },
              {
                title: t(p("precision")),
                key: "precision",
                node: (
                  <>
                    <Form.Item label={t(pCommon("cluster"))} name="cluster">
                      <SingleClusterSelector />
                    </Form.Item>
                    <Form.Item label={t(pCommon("workId"))} name="jobId">
                      <InputNumber style={{ minWidth: "160px" }} min={1} />
                    </Form.Item>
                  </>
                ),
              },
            ]}
          />
        </Form>
      </FilterFormContainer>
      <RunningJobInfoTable
        data={filteredData}
        isLoading={isLoading}
        showAccount={showAccount}
        showUser={showUser}
        showCluster={false}
        reload={reload}
        selection={{
          selected, setSelected,
        }}
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
  selection?: {
    selected: RunningJobInfo[];
    setSelected: (d: RunningJobInfo[]) => void;
  }
};

const ChangeJobTimeLimitModalLink = ModalLink(ChangeJobTimeLimitModal);

export const RunningJobInfoTable: React.FC<JobInfoTableProps> = ({
  data, isLoading, reload, showAccount, showUser, showCluster, selection,
}) => {

  const [previewItem, setPreviewItem] = useState<RunningJobInfo | undefined>(undefined);

  // 非用户页面或者用户页面且用户允许修改作业时限
  const changeJobLimitEnabled = showUser || (!showUser && publicConfig.CHANGE_JOB_LIMIT.allowUser);

  const t = useI18nTranslateToString();
  const languageId = useI18n().currentLanguage.id;

  return (
    <>
      {selection ? (
        <TableTitle>
          <Space>
            {changeJobLimitEnabled && (
              <BatchChangeJobTimeLimitButton
                data={selection.selected}
                disabled={isLoading || selection.selected.length === 0}
                reload={reload}
              />
            )}
          </Space>
        </TableTitle>
      ) : undefined}
      <Table
        {...(selection ? {
          rowSelection: {
            type: "checkbox",
            selectedRowKeys: selection.selected.map(runningJobId),
            onChange: (_selectedRowKeys: React.Key[], selectedRows: RunningJobInfo[]) => {
              selection.setSelected(selectedRows);
            },
            getCheckboxProps: (record: RunningJobInfo) => ({
              name: record.name,
            }),
          },
        } : {})}
        dataSource={data}
        loading={isLoading}
        pagination={{
          showSizeChanger: true,
          defaultPageSize: DEFAULT_PAGE_SIZE,
        }}
        rowKey={runningJobId}
        scroll={{ x: data?.length ? 1800 : true }}
        tableLayout="fixed"
      >
        {
          showCluster && (
            <Table.Column<RunningJobInfo>
              dataIndex="cluster"
              width="9.5%"
              title={t(pCommon("cluster"))}
              render={(_, r) => getI18nConfigCurrentText(r.cluster.name, languageId)}
            />
          )
        }
        <Table.Column<RunningJobInfo>
          dataIndex="jobId"
          width="5%"
          title={t(pCommon("workId"))}
          sorter={(a, b) => (isNaN(Number(a.jobId)) || isNaN(Number(b.jobId))) ?
            a.jobId.localeCompare(b.jobId) : Number(a.jobId) - Number(b.jobId)}
        />
        {
          showUser && (
            <Table.Column<RunningJobInfo>
              dataIndex="user"
              width="8%"
              ellipsis
              title={t(pCommon("user"))}
              sorter={(a, b) => a.user.localeCompare(b.user)}
            />
          )
        }
        {
          showAccount && (
            <Table.Column<RunningJobInfo>
              dataIndex="account"
              width="9.5%"
              ellipsis
              title={t(pCommon("account"))}
              sorter={(a, b) => a.account.localeCompare(b.account)}
            />
          )
        }
        <Table.Column<RunningJobInfo>
          dataIndex="name"
          ellipsis
          title={t(pCommon("workName"))}
          sorter={(a, b) => a.name.localeCompare(b.name)}
        />
        <Table.Column<RunningJobInfo>
          dataIndex="partition"
          width="6.3%"
          ellipsis
          title={t(pCommon("partition"))}
          sorter={(a, b) => a.partition.localeCompare(b.partition)}
        />
        <Table.Column<RunningJobInfo>
          dataIndex="qos"
          width="6.3%"
          ellipsis
          title="QOS"
          sorter={(a, b) => (isNaN(Number(a.qos)) || isNaN(Number(b.qos))) ?
            a.qos.localeCompare(b.qos) : Number(a.qos) - Number(b.qos)}
        />
        <Table.Column<RunningJobInfo>
          dataIndex="nodes"
          width="4.4%"
          title={t(p("nodes"))}
          sorter={(a, b) => (isNaN(Number(a.nodes)) || isNaN(Number(b.nodes))) ?
            a.nodes.localeCompare(b.nodes) : Number(a.nodes) - Number(b.nodes)}
        />
        <Table.Column<RunningJobInfo>
          dataIndex="cores"
          width="4.4%"
          title={t(p("cores"))}
          sorter={(a, b) => (isNaN(Number(a.cores)) || isNaN(Number(b.cores))) ?
            a.cores.localeCompare(b.cores) : Number(a.cores) - Number(b.cores)}
        />
        <Table.Column<RunningJobInfo>
          dataIndex="gpus"
          width="4.4%"
          title={t(p("gpus"))}
          sorter={(a, b) => (isNaN(Number(a.gpus)) || isNaN(Number(b.gpus))) ?
            a.gpus.localeCompare(b.gpus) : Number(a.gpus) - Number(b.gpus)}
        />
        <Table.Column<RunningJobInfo>
          dataIndex="state"
          width="6%"
          title={t(pCommon("status"))}
          sorter={(a, b) => a.state.localeCompare(b.state)}
        />
        <Table.Column<RunningJobInfo>
          dataIndex="runningOrQueueTime"
          width="6.3%"
          title={t(p("time"))}
          sorter={(a, b) => compareTimeAsSeconds(a.runningOrQueueTime, b.runningOrQueueTime)}
        />
        <Table.Column<RunningJobInfo>
          dataIndex="nodesOrReason"
          ellipsis={true}
          title={t(p("reason"))}
          render={(d: string) => d.startsWith("(") && d.endsWith(")") ? d.substring(1, d.length - 1) : d}
          sorter={(a, b) => a.nodesOrReason.localeCompare(b.nodesOrReason)}
        />
        <Table.Column<RunningJobInfo>
          dataIndex="timeLimit"
          width="6.5%"
          title={t(p("limit"))}
          sorter={(a, b) => compareTimeAsSeconds(a.timeLimit, b.timeLimit)}
        />

        <Table.Column<RunningJobInfo>
          title={t(pCommon("more"))}
          width="12%"
          fixed="right"
          render={(_, r) => (
            <Space>
              <a onClick={() => setPreviewItem(r)}>{t(pCommon("detail"))}</a>
              <Popconfirm
                title={t(p("finishJobConfirm"))}
                onConfirm={async () =>
                  api.cancelJob({
                    query: {
                      cluster: r.cluster.id,
                      jobId: r.jobId,
                    },
                  }).then(() => {
                    message.success(t(p("finishJobSuccess")));
                    reload();
                  })
                }
              >
                <a>{t(p("finishJobButton"))}</a>
              </Popconfirm>
              {changeJobLimitEnabled && (
                <ChangeJobTimeLimitModalLink
                  reload={reload}
                  data={[r]}
                >
                  {t(p("changeLimit"))}
                </ChangeJobTimeLimitModalLink>
              )}
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


