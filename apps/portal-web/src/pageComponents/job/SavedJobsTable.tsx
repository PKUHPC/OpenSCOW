import { Button, Form, Space, Table } from "antd";
import Link from "next/link";
import React, { useCallback, useState } from "react";
import { useAsync } from "react-async";
import { useStore } from "simstate";
import { api } from "src/apis";
import { SingleClusterSelector } from "src/components/ClusterSelector";
import { FilterFormContainer } from "src/components/FilterFormContainer";
import { JobTemplate } from "src/generated/portal/job";
import { DefaultClusterStore } from "src/stores/DefaultClusterStore";
import type { Cluster } from "src/utils/config";

interface Props {}

interface FilterForm {
  cluster: Cluster;
}

export const SavedJobsTable: React.FC<Props> = () => {

  const defaultClusterStore = useStore(DefaultClusterStore);

  const [query, setQuery] = useState<FilterForm>(() => {
    return {
      cluster: defaultClusterStore.cluster,
    };
  });

  const [form] = Form.useForm<FilterForm>();

  const promiseFn = useCallback(async () => {
    return await api.getSavedJobs({ query: {
      cluster: query.cluster.id,
    } }).then((x) => x.results);
  }, [query.cluster]);

  const { data, isLoading, reload } = useAsync({ promiseFn });

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
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">搜索</Button>
              <Button loading={isLoading} onClick={reload}>刷新</Button>
            </Space>
          </Form.Item>
        </Form>
      </FilterFormContainer>
      <InfoTable
        data={data}
        isLoading={isLoading}
        cluster={query.cluster}
      />
    </div>
  );
};

interface InfoTableProps {
  data?: JobTemplate[];
  isLoading: boolean;
  cluster: Cluster;
}

const InfoTable: React.FC<InfoTableProps> = ({
  data, isLoading, cluster,
}) => {

  return (
    <Table
      dataSource={data}
      loading={isLoading}
      pagination={{ showSizeChanger: true }}
      rowKey={(x) => x.jobName}
      scroll={{ x: true }}
    >
      <Table.Column<JobTemplate>
        dataIndex="jobName"
        title="模板名"
        sorter={(a, b) => a.jobName.localeCompare(b.jobName)}
      />
      <Table.Column<JobTemplate> dataIndex="comment" title="备注" />
      <Table.Column<JobTemplate>
        title="操作"
        render={(_, r) => (
          <Space>
            <Link href={{
              pathname: "/jobs/submit",
              query: {
                cluster: cluster.id,
                savedJobId: r.id,
              },
            }}
            >
              使用模板
            </Link>
          </Space>
        )}
      />
    </Table>
  );
};


