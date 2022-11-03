import { Button, DatePicker, Form, InputNumber, Space, Table } from "antd";
import moment from "moment";
import Router from "next/router";
import { join } from "path";
import React, { useCallback, useMemo, useState } from "react";
import { useAsync } from "react-async";
import { api } from "src/apis";
import { SingleClusterSelector } from "src/components/ClusterSelector";
import { FilterFormContainer } from "src/components/FilterFormContainer";
import { JobInfo } from "src/generated/portal/job";
import { Cluster, publicConfig } from "src/utils/config";
import { defaultRanges, formatDateTime } from "src/utils/datetime";
import { compareNumber } from "src/utils/math";

interface FilterForm {
  time: [moment.Moment, moment.Moment];
  jobId: number | undefined;
  cluster: Cluster;
}

interface Props {
  userId: string;
}

export const AllJobQueryTable: React.FC<Props> = ({
  userId,
}) => {

  const [query, setQuery] = useState<FilterForm>(() => {
    const now = moment();
    return {
      time: [now.clone().subtract(1, "week"), now],
      jobId: undefined,
      cluster: publicConfig.CLUSTERS[0],
    };
  });

  const [form] = Form.useForm<FilterForm>();

  const promiseFn = useCallback(async () => {
    return await api.getAllJobs({ query: {
      cluster: query.cluster.id,
      startTime: query.time[0].toISOString(),
      endTime: query.time[1].toISOString(),
    } });
  }, [userId, query.cluster, query.time]);

  const { data, isLoading, reload } = useAsync({ promiseFn });

  const filteredData = useMemo(() => {
    if (!data) { return undefined; }

    let filtered = data.results;
    if (query.jobId) {
      filtered = filtered.filter((x) => x.jobId === query.jobId);
    }

    return filtered;
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
          <Form.Item label="时间" name="time">
            <DatePicker.RangePicker
              showTime
              ranges={defaultRanges()}
              allowClear={false}
            />
          </Form.Item>
          <Form.Item label="集群作业ID" name="jobId">
            <InputNumber style={{ minWidth: "160px" }} min={1} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">搜索</Button>
          </Form.Item>
        </Form>
      </FilterFormContainer>
      <JobInfoTable
        data={filteredData}
        isLoading={isLoading}
        reload={reload}
        cluster={query.cluster}
      />
    </div>
  );
};

type JobInfoTableProps = {
  data: JobInfo[] | undefined;
  isLoading: boolean;
  reload: () => void;
  cluster: Cluster;
};

export const JobInfoTable: React.FC<JobInfoTableProps> = ({
  data, isLoading, cluster,
}) => {

  return (
    <Table
      dataSource={data}
      loading={isLoading}
      pagination={{ showSizeChanger: true }}
      rowKey={(x) => x.jobId}
      scroll={{ x: true }}
    >
      <Table.Column<JobInfo>
        dataIndex="jobId"
        title="作业ID"
        sorter={(a, b) => compareNumber(+a.jobId, +b.jobId)}
        defaultSortOrder="descend"
      />
      <Table.Column<JobInfo> dataIndex="name" title="作业名" />
      <Table.Column<JobInfo> dataIndex="account" title="账户" />
      <Table.Column<JobInfo> dataIndex="partition" title="分区" />
      <Table.Column<JobInfo> dataIndex="qos" title="QOS" />
      <Table.Column<JobInfo> dataIndex="state" title="状态" />
      <Table.Column<JobInfo>
        dataIndex="submitTime"
        title="提交时间"
        render={(t) => formatDateTime(t)}
      />
      <Table.Column<JobInfo>
        dataIndex="elapsed"
        title="运行时间"
      />
      <Table.Column<JobInfo> dataIndex="timeLimit" title="作业时间限制" />
      <Table.Column<JobInfo>
        dataIndex="reason"
        title="说明"
        render={(d: string) => d.startsWith("(") && d.endsWith(")") ? d.substring(1, d.length - 1) : d}
      />
      <Table.Column<JobInfo>
        title="更多"
        render={(_, r) => (
          <Space>
            <a onClick={() => Router.push(join("/files", cluster.id, r.workingDirectory))}>
                进入目录
            </a>
          </Space>
        )}
      />
    </Table>
  );
};


