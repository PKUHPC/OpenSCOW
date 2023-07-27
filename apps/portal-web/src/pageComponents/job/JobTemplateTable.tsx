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

import { JobTemplateInfo } from "@scow/protos/build/portal/job";
import { Button, Form, Space, Table } from "antd";
import Link from "next/link";
import React, { useCallback, useState } from "react";
import { useAsync } from "react-async";
import { api } from "src/apis";
import { FilterFormContainer } from "src/components/FilterFormContainer";
import { SingleClusterSelector, useDefaultCluster } from "src/layouts/DefaultCluster";
import { type Cluster } from "src/utils/config";

interface Props {}

interface FilterForm {
  cluster: Cluster;
}

export const JobTemplateTable: React.FC<Props> = () => {

  const { defaultCluster } = useDefaultCluster();

  const [query, setQuery] = useState<FilterForm>(() => {
    return {
      cluster: defaultCluster,
    };
  });

  const [form] = Form.useForm<FilterForm>();

  const promiseFn = useCallback(async () => {
    return await api.listJobTemplates({ query: {
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
  data?: JobTemplateInfo[];
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
      <Table.Column<JobTemplateInfo>
        dataIndex="jobName"
        title="模板名"
        sorter={(a, b) => a.jobName.localeCompare(b.jobName)}
      />
      <Table.Column<JobTemplateInfo> dataIndex="comment" title="备注" />
      <Table.Column<JobTemplateInfo>
        title="操作"
        render={(_, r) => (
          <Space>
            <Link href={{
              pathname: "/jobs/submit",
              query: {
                cluster: cluster.id,
                jobTemplateId: r.id,
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


