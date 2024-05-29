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
import { DEFAULT_PAGE_SIZE } from "@scow/lib-web/build/utils/pagination";
import { Static } from "@sinclair/typebox";
import { App, Button, Form, Input, Popover, Space, Table, Tag, Tooltip } from "antd";
import Link from "next/link";
import React, { useCallback, useMemo, useState } from "react";
import { useAsync } from "react-async";
import { api } from "src/apis";
import { SingleClusterSelector } from "src/components/ClusterSelector";
import { FilterFormContainer } from "src/components/FilterFormContainer";
import { prefix, useI18nTranslateToString } from "src/i18n";
import { AccountTenantPartition, AssignablePartition } from "src/models/cluster";

import { PartitionAssignmentLink } from "./PartitionAssignmentModal";


interface FilterForm {
  clusterId: string | undefined;
  partition: string | undefined;
}

interface AvailablePartitionCollectionProps {
  data: AssignablePartition[] | undefined;
  isLoading: boolean;
  reload: () => void;
}

export const AvailablePartitionCollectionTable: React.FC<AvailablePartitionCollectionProps> = ({
  data, isLoading, reload,
}) => {

  const { message, modal } = App.useApp();
  const [form] = Form.useForm<FilterForm>();

  // const t = useI18nTranslateToString();
  // const DisplayedStateI18nTexts = getDisplayedStateI18nTexts(t);
  const [currentPageNum, setCurrentPageNum] = useState<number>(1);

  const [query, setQuery] = useState<FilterForm>({
    // 默认集群
    clusterId: undefined,
    partition: undefined,
  });

  const filteredData = useMemo(() => data ? data.filter((x) => (
    // !query.name
    //   || (operationType === PartitionOperationType.TENANT_OPERATION && x.tenantName.includes(query.name))
    //   || (operationType === PartitionOperationType.ACCOUNT_OPERATION && x.accountName.includes(query.name))
    true
  )) : undefined, [data, query]);

  return (
    <div>
      <FilterFormContainer style={{ display: "flex", justifyContent: "space-between" }}>
        <Form<FilterForm>
          layout="inline"
          form={form}
          initialValues={query}
          onFinish={async () => {
            const { partition } = await form.validateFields();
            setQuery(await form.validateFields());
            setCurrentPageNum(1);
          }}
        >
          <Form.Item label="集群" name="clusterId">
            <SingleClusterSelector />
          </Form.Item>
          <Form.Item name="partition">
            <Input allowClear placeholder="分区" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">搜索</Button>
          </Form.Item>
        </Form>
      </FilterFormContainer>

      <Table
        tableLayout="fixed"
        dataSource={filteredData}
        loading={isLoading}
        pagination={{
          showSizeChanger: true,
          defaultPageSize: DEFAULT_PAGE_SIZE,
          current: currentPageNum,
          onChange: (page) => setCurrentPageNum(page),
        }}
        // rowKey="userId"
        // scroll={{ x: filteredData?.length ? 1200 : true }}
      >
        <Table.Column<AssignablePartition>
          dataIndex="clusterId"
          title="集群"
        />
        <Table.Column<AssignablePartition>
          dataIndex="partition"
          title="分区"
          // sorter={(a, b) => a.accountName.localeCompare(b.accountName)}
          // sortDirections={["ascend", "descend"]}
          // sortOrder={currentSortInfo.field === "accountName" ? currentSortInfo.order : null}
        />
        <Table.Column<AssignablePartition>
          title="移出分区"
          render={(_, r) => (
            <Space>
              <a onClick={() => {
                modal.confirm({
                  title: "移出分区",
                  icon: <ExclamationCircleOutlined />,
                  content: `确认从租户的可用分区集下移出可用分区${r.partition}吗？移出后新建账户将不可使用该分区。`,
                  onOk: async () => {
                    // 移出分区请求
                    // await api.dewhitelistAccount({ query: {
                    //   accountName: r.accountName,
                    // } })
                    //   .then(() => {
                    //     message.success(t(p("removeWhiteSuccess")));
                    //     reload();
                    //   });
                  },
                });
              }}
              >
                移出
              </a>
            </Space>
          )}
        />
      </Table>
    </div>
  );
};
