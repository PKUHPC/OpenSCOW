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
import { Button, DatePicker, Form, Table } from "antd";
import dayjs from "dayjs";
import { useCallback, useState } from "react";
import { useAsync } from "react-async";
import { api } from "src/apis";
import { FilterFormContainer } from "src/components/FilterFormContainer";
import { AccountSelector } from "src/pageComponents/finance/AccountSelector";
import { TenantSelector } from "src/pageComponents/tenant/TenantSelector"; 

export enum SearchType {
    account = "account",
    tenant = "tenant",
}

interface Props {
  // 账户充值记录专用项
  accountName?: string;
  // 展示账户或租户下拉搜索，不传就不展示,同时区分后端接口，值为tenant时，获取租户的记录
  searchType?: SearchType;
  // 列表中是否展示账户 
  showAccountName?: boolean;
  // 列表中是否展示租户 
  showTenantName?: boolean;
  // 列表中是否展示IP地址和操作者ID 
  showAuditInfo?: boolean;
}

// 表格展示的数据
interface TableProps {
  time: string;
  amount: number;
  comment: string;
  type: string;
  index: number;
  ipAddress: string;
  operatorId: string;
  tenantName?: string;
  accountName?: string;
}

interface FilterForm {
  // 账户名或租户名
  name?: string;
  time: [dayjs.Dayjs, dayjs.Dayjs],
}

const today = dayjs().endOf("day");

export const PaymentTable: React.FC<Props> = ({
  accountName, searchType, showAccountName,
  showTenantName, showAuditInfo,
}) => {

  const [form] = Form.useForm<FilterForm>();

  const [query, setQuery] = useState(() => ({
    name: accountName,
    time: [today.subtract(1, "year"), today],
  }));

  const { data, isLoading } = useAsync({
    promiseFn: useCallback(async () => {
      const param = {
        startTime: query.time[0].clone().startOf("day").toISOString(),
        endTime: query.time[1].clone().endOf("day").toISOString(),
      };

      if (searchType === SearchType.tenant) {
        return api.getTenantPayments({ query: { ...param, tenantName:query.name } });
      } else {
        // 展示账户名时，是在搜索账户的记录
        if (showAccountName) {
          return api.getPayments({
            query: { ...param, accountName:query.name },
          });
        }
        else {
          return api.getPayments({
            query: { ...param, accountName:query.name, searchTenant:true },
          });
        }

      }
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
            const { name, time } = await form.validateFields();
            setQuery({ name: accountName ?? name, time });
          }}
        >
          {searchType ? (
            <Form.Item label={searchType === SearchType.account ? "账户" : "租户" } name="name">
              {searchType === SearchType.account ? (
                <AccountSelector
                  onChange={(item) => {
                    setQuery({ ...query, name:item });
                  }}
                  placeholder="请选择账户"
                />
              ) : (
                <TenantSelector
                  onChange={(item) => {
                    setQuery({ ...query, name:item });

                  }}
                  placeholder="请选择租户"
                />
              )}
            </Form.Item>
          )
            : undefined}
          <Form.Item label="时间" name="time">
            <DatePicker.RangePicker allowClear={false} presets={defaultPresets} />
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
        dataSource={data?.results as Array<TableProps>}
        loading={isLoading}
        scroll={{ x: true }}
        pagination={{ showSizeChanger: true }}
      >
        {
          showAccountName ? <Table.Column dataIndex="accountName" title="账户" /> : undefined
        }
        {
          showTenantName ? <Table.Column dataIndex="tenantName" title="租户" /> : undefined
        }
        <Table.Column dataIndex="time" title="交费日期" render={(v) => formatDateTime(v)} />
        <Table.Column dataIndex="amount" title="交费金额" render={(v) => v.toFixed(3)} />
        <Table.Column dataIndex="type" title="类型" />
        <Table.Column dataIndex="comment" title="备注" />
        {
          showAuditInfo ? (
            <>
              <Table.Column dataIndex="ipAddress" title="IP地址" />
              <Table.Column dataIndex="operatorId" title="操作者ID" />
            </>
          ) : undefined
        }
      </Table>
    </div>

  );
};
