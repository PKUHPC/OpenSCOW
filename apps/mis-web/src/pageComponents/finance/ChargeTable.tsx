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

import { defaultPresets, formatDateTime } from "@scow/lib-web/build/utils/datetime";
import { useDidUpdateEffect } from "@scow/lib-web/build/utils/hooks";
import { Button, DatePicker, Form, Select, Table } from "antd";
import dayjs from "dayjs";
import { useCallback, useState } from "react";
import { useAsync } from "react-async";
import { api } from "src/apis";
import { FilterFormContainer } from "src/components/FilterFormContainer";
import { SearchType } from "src/models/User";
import { publicConfig } from "src/utils/config";
import { CHARGE_TYPE_OTHERS } from "src/utils/constants";

import { AccountSelector } from "./AccountSelector";

interface Props {
  accountName?: string;
  showAccountName: boolean;
  showTenantName: boolean;
  isPlatformRecords?: boolean;
  searchType?: SearchType;
}

interface FilterForm {
  name?: string;
  time: [dayjs.Dayjs, dayjs.Dayjs];
  type?: string;
}

const now = dayjs();

export const ChargeTable: React.FC<Props> = ({
  accountName, showAccountName, showTenantName, isPlatformRecords, searchType }) => {

  const [form] = Form.useForm<FilterForm>();

  const [query, setQuery] = useState<{name: string | undefined, time: dayjs.Dayjs[], type: string | undefined}>({
    name: accountName,
    time: [now.subtract(1, "week").startOf("day"), now.endOf("day")],
    type: undefined,
  });

  const filteredTypes = [...publicConfig.CHARGE_TYPE_LIST, CHARGE_TYPE_OTHERS];

  const { data, isLoading } = useAsync({
    promiseFn: useCallback(async () => {

      return api.getCharges({ query: {
        accountName: query.name,
        startTime: query.time[0].toISOString(),
        endTime: query.time[1].toISOString(),
        type: query.type,
        isPlatformRecords,
        searchType,
      } });

    }, [query]),
  });

  useDidUpdateEffect(() => {
    setQuery((q) => ({ ...q, accountName: accountName }));
  }, [accountName]);

  return (
    <div>
      <FilterFormContainer>
        <Form<FilterForm>
          layout="inline"
          form={form}
          initialValues={query}
          onFinish={async () => {
            const { name, time, type } = await form.validateFields();
            setQuery({ name: accountName ?? name, time, type: type });
          }}
        >
          {
            showAccountName && (
              <Form.Item label="账户" name="name">
                <AccountSelector
                  onChange={(value) => {
                    setQuery({ ...query, name: value });
                  }}
                  placeholder="请选择账户"
                  fromAllTenants={showTenantName ? true : false}
                />
              </Form.Item>
            )
          }
          <Form.Item label="时间" name="time">
            <DatePicker.RangePicker allowClear={false} presets={defaultPresets} />
          </Form.Item>
          <Form.Item label="类型" name="type">
            <Select
              style={{ minWidth: "100px" }}
              allowClear
              onChange={(value) => {
                setQuery({ ...query, type: value });
              }}
              placeholder="请选择类型"
            >
              {(filteredTypes).map((x) => (
                <Select.Option key={x} value={x}>
                  {x}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="总数">
            <strong>
              {data ? data.results.length : 0}
            </strong>
          </Form.Item>
          <Form.Item label="合计">
            <strong>
              {data ? data.total.toFixed(3) : 0}
            </strong>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">搜索</Button>
          </Form.Item>
        </Form>
      </FilterFormContainer>
      <Table
        dataSource={data?.results}
        loading={isLoading}
        scroll={{ x: true }}
        pagination={{ showSizeChanger: true }}
      >
        {
          showAccountName && (
            <Table.Column dataIndex="accountName" title="账户" />
          )
        }
        {
          showTenantName && (
            <Table.Column dataIndex="tenantName" title="租户" />
          )
        }
        <Table.Column dataIndex="time" title="扣费日期" render={(v) => formatDateTime(v)} />
        <Table.Column dataIndex="amount" title="扣费金额" render={(v) => v.toFixed(3)} />
        <Table.Column dataIndex="type" title="类型" />
        <Table.Column dataIndex="comment" title="备注" />
      </Table>
    </div>

  );
};
