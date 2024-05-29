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
import { FilterFormContainer } from "src/components/FilterFormContainer";
import { prefix, useI18nTranslateToString } from "src/i18n";
import { AccountTenantPartition, PartitionOperationType, testAccountData1, testTenantData1 } from "src/models/cluster";

import { PartitionAssignmentLink } from "./PartitionAssignmentModal";


interface Props {
  refreshToken: boolean;
  operationType: PartitionOperationType;
}

interface FilterForm {
  name: string | undefined;
}

const p = prefix("pageComp.accounts.accountTable.");
const pCommon = prefix("common.");

export const PartitionManagementTable: React.FC<Props> = ({ operationType, refreshToken }) => {
  const promiseFn = useCallback(async () => {
    // 获取租户/账户分区管理信息
    const testData = operationType === PartitionOperationType.TENANT_OPERATION ?
      [testTenantData1] : [testAccountData1];
    // return await api.getAllTenants({}); }, []);
    return testData; }, []);
  const { data, isLoading, reload } = useAsync({ promiseFn, watch: refreshToken });

  return (
    <div>
      <PartitionManagementInfoTable
        data={data}
        isLoading={isLoading}
        reload={reload}
        operationType={operationType}
      />
    </div>
  );
};

interface PartitionManagementInfoTableProps {
  data: AccountTenantPartition[] | undefined;
  isLoading: boolean;
  reload: () => void;
  operationType: PartitionOperationType;
}

const PartitionManagementInfoTable: React.FC<PartitionManagementInfoTableProps> = ({
  data, isLoading, reload, operationType,
}) => {

  const { message } = App.useApp();
  const [form] = Form.useForm<FilterForm>();

  // const t = useI18nTranslateToString();
  // const DisplayedStateI18nTexts = getDisplayedStateI18nTexts(t);
  const [currentPageNum, setCurrentPageNum] = useState<number>(1);

  const [query, setQuery] = useState<FilterForm>({
    name: undefined,
  });

  const filteredData = useMemo(() => data ? data.filter((x) => (
    !query.name
      || (operationType === PartitionOperationType.TENANT_OPERATION && x.tenantName.includes(query.name))
      || (operationType === PartitionOperationType.ACCOUNT_OPERATION && x.accountName.includes(query.name))
  )) : undefined, [data, query]);

  return (
    <div>
      <FilterFormContainer style={{ display: "flex", justifyContent: "space-between" }}>
        <Form<FilterForm>
          layout="inline"
          form={form}
          initialValues={query}
          onFinish={async () => {
            setQuery(await form.validateFields());
            setCurrentPageNum(1);
          }}
        >
          <Form.Item label={operationType === PartitionOperationType.TENANT_OPERATION ? "租户" : "账户"} name="name">
            <Input />
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
        {
          operationType === PartitionOperationType.TENANT_OPERATION && (
            <Table.Column<AccountTenantPartition>
              dataIndex="tenantName"
              title="租户"
            />
          )
        }
        {
          operationType === PartitionOperationType.ACCOUNT_OPERATION && (
            <Table.Column<AccountTenantPartition>
              dataIndex="accountName"
              title="账户"
            />
          )
        }
        <Table.Column<AccountTenantPartition>
          dataIndex="assignedTotalCount"
          title="可用分区数"
          // sorter={(a, b) => a.accountName.localeCompare(b.accountName)}
          // sortDirections={["ascend", "descend"]}
          // sortOrder={currentSortInfo.field === "accountName" ? currentSortInfo.order : null}
        />
        <Table.Column<AccountTenantPartition>
          title="操作"
          width="15%"
          fixed="right"
          render={(_, r) => (
            <Space>
              <>
                <PartitionAssignmentLink
                  accountName={r.accountName}
                  tenantName={r.tenantName}
                  assignablePartitions={r.assignablePartitions}
                  operationType={operationType}
                  reload={reload}
                >
                  配置
                </PartitionAssignmentLink>
              </>

            </Space>
          )}
        />
      </Table>
    </div>
  );
};
