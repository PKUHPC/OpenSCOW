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
import { Button, Form, Input, InputNumber, Select, Space, Table } from "antd";
import { t } from "i18next";
import { useTranslation } from "next-i18next";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { useAsync } from "react-async";
import { useStore } from "simstate";
import { api } from "src/apis";
import { SingleClusterSelector } from "src/components/ClusterSelector";
import { FilterFormContainer, FilterFormTabs } from "src/components/FilterFormContainer";
import { ModalLink } from "src/components/ModalLink";
import { TableTitle } from "src/components/TableTitle";
import { runningJobId, RunningJobInfo } from "src/models/job";
import { BatchChangeJobTimeLimitButton } from "src/pageComponents/job/BatchChangeJobTimeLimitButton";
import { ChangeJobTimeLimitModal } from "src/pageComponents/job/ChangeJobTimeLimitModal";
import { RunningJobDrawer } from "src/pageComponents/job/RunningJobDrawer";
import { DefaultClusterStore } from "src/stores/DefaultClusterStore";
import { Cluster, publicConfig } from "src/utils/config";

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

export const RunningJobQueryTable: React.FC<Props> = ({
  userId, accountNames, showUser, showAccount, filterAccountName = true,
}) => {

  const searchType = useRef<"precision" | "range">("range");

  const [selected, setSelected] = useState<RunningJobInfo[]>([]);

  const defaultClusterStore = useStore(DefaultClusterStore);

  const [query, setQuery] = useState<FilterForm>(() => {
    return {
      accountName: typeof accountNames === "string" ? accountNames : undefined,
      jobId: undefined,
      cluster: defaultClusterStore.cluster,
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
    return await api.getRunningJobs({ query: {
      userId: userId || undefined,
      cluster: query.cluster.id,
      accountName: searchType.current === "precision" ? undefined : (query.accountName || undefined),
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

    return filtered.map((x) => RunningJobInfo.fromGrpc(x, publicConfig.CLUSTERS[query.cluster.id]));
  }, [data, query.jobId]);

  const { t } = useTranslation("translations", { keyPrefix: "running-job" });

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
                <Button type="primary" htmlType="submit">
                  {t("search.button.search")}
                </Button>
                <Button onClick={reload} loading={isLoading}>
                  {t("search.button.refresh")}
                </Button>
              </Space>
            )}
            tabs={[
              {
                title: t("search.batch"),
                key: "range",
                node: (
                  <>
                    <Form.Item label={t("search.cluster")} name="cluster">
                      <SingleClusterSelector />
                    </Form.Item>
                    {
                      filterAccountName
                        ? accountNames
                          ? (
                            <Form.Item label="账户" name="accountName">
                              <Select style={{ minWidth: 96 }} allowClear>
                                {(Array.isArray(accountNames) ? accountNames : [accountNames]).map((x) => (
                                  <Select.Option key={x} value={x}>{x}</Select.Option>
                                ))}
                              </Select>
                            </Form.Item>
                          ) : (
                            <Form.Item label="账户" name="accountName">
                              <Input />
                            </Form.Item>
                          )
                        : undefined
                    }
                  </>
                ),

              },
              {
                title: t("search.precision"),
                key: "precision",
                node: (
                  <>
                    <Form.Item label="集群" name="cluster">
                      <SingleClusterSelector />
                    </Form.Item>
                    <Form.Item label="集群作业ID" name="jobId">
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
  data, isLoading, reload, showAccount, showCluster, showUser, selection,
}) => {

  const { t } = useTranslation("translations", { keyPrefix: "running-job.job-table" });

  const [previewItem, setPreviewItem] = useState<RunningJobInfo | undefined>(undefined);

  return (
    <>
      {selection ? (
        <TableTitle>
          <Space>
            <BatchChangeJobTimeLimitButton
              data={selection.selected}
              disabled={isLoading || selection.selected.length === 0}
              reload={reload}
            />
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
        pagination={{ showSizeChanger: true }}
        rowKey={runningJobId}
        scroll={{ x: true }}
      >
        {
          showCluster && (
            <Table.Column<RunningJobInfo>
              dataIndex="cluster"
              // title="集群"
              title={t("cluster")}
              render={(_, r) => r.cluster.name}
            />
          )
        }
        {/* <Table.Column<RunningJobInfo> dataIndex="jobId" title="作业ID" /> */}
        <Table.Column<RunningJobInfo> dataIndex="jobId" title={t("jobId")} />
        {
          showUser && (
            <Table.Column<RunningJobInfo> dataIndex="user" title="用户" />
          )
        }
        {
          showAccount && (
            // <Table.Column<RunningJobInfo> dataIndex="account" title="账户" />
            <Table.Column<RunningJobInfo> dataIndex="account" title={t("account")} />
          )
        }
        {/* <Table.Column<RunningJobInfo> dataIndex="name" title="作业名" />
        <Table.Column<RunningJobInfo> dataIndex="partition" title="分区" />
        <Table.Column<RunningJobInfo> dataIndex="qos" title="QOS" />
        <Table.Column<RunningJobInfo> dataIndex="nodes" title="节点数" />
        <Table.Column<RunningJobInfo> dataIndex="cores" title="核心数" />
        <Table.Column<RunningJobInfo> dataIndex="state" title="状态" /> */}
        <Table.Column<RunningJobInfo> dataIndex="name" title={t("name")} />
        <Table.Column<RunningJobInfo> dataIndex="partition" title={t("partition")} />
        <Table.Column<RunningJobInfo> dataIndex="qos" title={t("qos")} />
        <Table.Column<RunningJobInfo> dataIndex="nodes" title={t("nodes")} />
        <Table.Column<RunningJobInfo> dataIndex="cores" title={t("cores")} />
        <Table.Column<RunningJobInfo> dataIndex="state" title={t("state")} />
        <Table.Column
          dataIndex="runningOrQueueTime"
          title={t("time")}
        />
        <Table.Column
          dataIndex="nodesOrReason"
          title={t("reason")}
          render={(d: string) => d.startsWith("(") && d.endsWith(")") ? d.substring(1, d.length - 1) : d}
        />
        <Table.Column<RunningJobInfo> dataIndex="timeLimit" title={t("limit")} />

        <Table.Column<RunningJobInfo>
          title={t("others")}
          render={(_, r) => (
            <Space>
              <a onClick={() => setPreviewItem(r)}>详情</a>
              <ChangeJobTimeLimitModalLink
                reload={reload}
                data={[r]}
              >
                修改作业时限
              </ChangeJobTimeLimitModalLink>
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


