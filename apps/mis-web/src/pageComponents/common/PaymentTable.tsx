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
import { useCallback, useMemo, useState } from "react";
import { useAsync } from "react-async";
import { api } from "src/apis";
import { FilterFormContainer } from "src/components/FilterFormContainer";
import { AccountSelector } from "src/pageComponents/finance/AccountSelector";
import { TenantSelector } from "src/pageComponents/tenant/TenantSelector"; 
import { PaymentInfo } from "src/pages/api/finance/payments"; ;
import { TenantPaymentInfo } from "src/pages/api/admin/finance/payments"; ;

export enum nameType {
    account = "账户",
    tenant = "租户",
}

interface Props {
  // 账户充值记录专用项
  accountName?: string;
  // 是否展示租户或账户搜索条件
  showNameSearch?: nameType;
  // 是否是平台管理获取数据
  adminData: boolean;
  // 列表中是否展示账户 
  showAccountName?: boolean;
  // 列表中是否展示租户 
  showTenantName?: boolean;
  // 列表中是否展示IP地址和操作者ID 
  showAuditInfo?: boolean;
}

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
  accountName, showNameSearch, adminData, showAccountName = false,
  showTenantName = false, showAuditInfo = false,
}) => {

  const [form] = Form.useForm<FilterForm>();

  const [query, setQuery] = useState(() => ({
    name: accountName ?? undefined,
    time: [today.subtract(1, "year"), today],
  }));

  const { data, isLoading } = useAsync({
    promiseFn: useCallback(async () => {
      const param = {
        startTime: query.time[0].clone().startOf("day").toISOString(),
        endTime: query.time[1].clone().endOf("day").toISOString(),
      };

      if (adminData) {
        return api.getTenantPayments({ query: { ...param, tenantName:query.name || undefined } });
      } else {
        if (showNameSearch === nameType.account) {
          return api.getPayments({
            query: { ...param, accountName:query.name || undefined, allAccount:true },
          });
        } else {
          return api.getPayments({
            query: { ...param, accountName:query.name || undefined },
          });
        }
      }
    }, [query]),
  });

  useDidUpdateEffect(() => {
    setQuery((q) => ({ ...q, accountName: accountName }));
  }, [accountName]);

  const accountNameColumn = useMemo(() => {
    if (data && "accountName" in data?.results[0] && showAccountName) {
      return <Table.Column dataIndex="accountName" title="账户" />;
    }
  }, [data, showAccountName]);

  const tenantNameColumn = useMemo(() => {
    if (data && "tenantName" in data?.results[0] && showTenantName) {
      return <Table.Column dataIndex="tenantName" title="租户" />;
    }
  }, [data, showTenantName]);
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
          {showNameSearch ? (
            <Form.Item label={showNameSearch} name="name">
              {showNameSearch === nameType.account ? (
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
        dataSource={data?.results as Array<TableProps> }
        loading={isLoading}
        scroll={{ x: true }}
        pagination={{ showSizeChanger: true }}
      >

        {accountNameColumn}
        {tenantNameColumn}

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
