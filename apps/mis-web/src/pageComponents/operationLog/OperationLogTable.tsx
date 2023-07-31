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

import { defaultPresets } from "@scow/lib-web/build/utils/datetime";
import { OperationLog } from "@scow/protos/build/server/operation_log";
import { Button, DatePicker, Form, Input, Select, Table } from "antd";
import dayjs from "dayjs";
import { useCallback, useState } from "react";
import { useAsync } from "react-async";
import { api } from "src/apis";
import { FilterFormContainer } from "src/components/FilterFormContainer";
import { OperationCode,
  OperationLogQueryType, OperationResult, OperationResultTexts,
  OperationType, OperationTypeTexts } from "src/models/operationLogModal";
import { User } from "src/stores/UserStore";

interface FilterForm {
  operatorUserId?: string;
  operationCode?: OperationCode;
  operationType?: OperationType;
  operationTime?: [dayjs.Dayjs, dayjs.Dayjs],
  operationResult?: OperationResult;
}

interface PageInfo {
  page: number;
  pageSize?: number;
}

interface Props {
  user: User;
  queryType: OperationLogQueryType;
  accountName?: string
}

const today = dayjs().endOf("day");

export const OperationLogTable: React.FC<Props> = ({ user, queryType, accountName }) => {

  const [ query, setQuery ] = useState<FilterForm>(() => {
    return {
      operatorUserId: undefined,
      operationCode: undefined,
      operationType: undefined,
      operationTime: [today.clone().subtract(30, "day"), today],
      operationResult: undefined,
    };
  });

  const [form] = Form.useForm<FilterForm>();

  const [pageInfo, setPageInfo] = useState<PageInfo>({ page: 1, pageSize: 10 });

  const getOperatorUserIds = () => {
    if (queryType === OperationLogQueryType.USER) {
      return [user.identityId];
    }
    return query.operatorUserId ? [query.operatorUserId] : [];
  };

  const promiseFn = useCallback(async () => {
    return await api.getOperationLogs({ query: {
      type: queryType,
      operatorUserIds: getOperatorUserIds().join(","),
      operationCode: query.operationCode,
      operationType: query.operationType,
      operationResult: query.operationResult,
      startTime: query.operationTime?.[0].toISOString(),
      endTime: query.operationTime?.[1].toISOString(),
      operationTargetAccountName: accountName,
      page: pageInfo.page,
      pageSize: pageInfo.pageSize,
    } });
  }, [query, pageInfo, queryType, accountName]);

  const { data, isLoading } = useAsync({ promiseFn });

  return (
    <div>
      <FilterFormContainer>
        <Form<FilterForm>
          form={form}
          layout="inline"
          initialValues={query}
          onFinish={async () => {
            const {
              operationCode, operationType, operatorUserId,
              operationResult, operationTime } = await form.validateFields();
            setQuery({ operationCode, operationType, operatorUserId, operationResult, operationTime });
            setPageInfo({ page: 1, pageSize: pageInfo.pageSize });
          }}
        >
          <Form.Item label="操作码" name="operationCode">
            <Input style={{ width: 100 }} />
          </Form.Item>
          <Form.Item label="操作行为" name="operationType">
            <Select
              options={
                Object.keys(OperationTypeTexts).map((key) => ({ value: key, label: OperationTypeTexts[key] }))
              }
              allowClear
              style={{ width: 180 }}
            />
          </Form.Item>
          <Form.Item label="操作结果" name="operationResult">
            <Select
              options={
                Object.keys(OperationResultTexts)
                  .filter((key) => key !== OperationResult.UNKNOWN.toString())
                  .map((key) => ({ value: key, label: OperationResultTexts[key] }))}
              allowClear
              style={{ width: 80 }}
            />
          </Form.Item>
          {queryType !== OperationLogQueryType.USER && (
            <Form.Item label="操作员" name="operationCode">
              <Input style={{ width: 150 }} />
            </Form.Item>
          )}
          <Form.Item label="操作时间" name="operationTime">
            <DatePicker.RangePicker allowClear={false} presets={defaultPresets} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">搜索</Button>
          </Form.Item>
        </Form>
      </FilterFormContainer>
      <Table
        dataSource={data?.results}
        loading={isLoading}
      >
        <Table.Column<OperationLog> dataIndex="operationCode" title="操作码" />
        <Table.Column<OperationLog>
          dataIndex="operationType"
          title="操作行为"
          render={(operationType) => OperationTypeTexts[operationType] }
        />
        <Table.Column<OperationLog> dataIndex="operationContent" title="操作内容" />
        <Table.Column<OperationLog>
          dataIndex="operationResult"
          title="操作结果"
          render={(operationResult) => OperationResultTexts[operationResult] }
        />
        <Table.Column<OperationLog> dataIndex="operationTime" title="操作时间" />
        <Table.Column<OperationLog> dataIndex="operatorUserId" title="操作员" />
        <Table.Column<OperationLog> dataIndex="operatorIp" title="操作IP" />
      </Table>
    </div>
  );
};
