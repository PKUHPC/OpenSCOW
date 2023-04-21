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
import { queryToString, useQuerystring } from "@scow/lib-web/build/utils/querystring";
import { Button, DatePicker, Form, Table } from "antd";
import dayjs from "dayjs";
import Router from "next/router";
import { useCallback, useState } from "react";
import { useAsync } from "react-async";
import { api } from "src/apis";
import { FilterFormContainer } from "src/components/FilterFormContainer";

import { TenantOrAccountRadio } from "./TenantOrAccountRadio";

interface Props {
  accountNames?: string[];
  showAccountName: boolean;
  /** IP地址和操作者ID */
  showAuditInfo: boolean;
}

interface FilterForm {
  accountName?: string;
  time: [dayjs.Dayjs, dayjs.Dayjs],
}

const today = dayjs().endOf("day");

export const PaymentTable: React.FC<Props> = ({
  accountNames, showAccountName, showAuditInfo,
}) => {

  const urlQuery = useQuerystring();
  const account = queryToString(urlQuery.account) || undefined;

  const [form] = Form.useForm<FilterForm>();

  const [query, setQuery] = useState(() => ({
    accountName: showAccountName ? account : accountNames?.[0],
    time: [today.subtract(1, "year"), today],
  }));

  const { data, isLoading } = useAsync({
    promiseFn: useCallback(async () => {
      return api.getPayments({
        query: {
          accountName: query.accountName,
          startTime: query.time[0].startOf("day").toISOString(),
          endTime: query.time[1].endOf("day").toISOString(),
        },
      });
    }, [query]),
  });

  useDidUpdateEffect(() => {
    setQuery((q) => ({ ...q, accountName: accountNames?.[0] }));
  }, [accountNames]);

  return (
    <div>
      <FilterFormContainer>
        <Form<FilterForm>
          layout="inline"
          form={form}
          initialValues={query}
          onFinish={async () => {
            const { accountName, time } = await form.validateFields();
            setQuery({ accountName: showAccountName ? accountName : query.accountName, time });
          }}
        >
          {
            // 根据是否在table展示账户名来判断是租户管理还是账户管理下的充值记录，如果是租户下才展示
            showAccountName ? (
              <Form.Item label="充值对象" name="accountName">
                <TenantOrAccountRadio
                  value={account || undefined}
                  onChange={(account) => {
                    setQuery((q) => ({ ...q, accountName: account }));
                    Router.push({
                      pathname: "/tenant/finance/payments", query: account ? { account } : undefined,
                    }); }
                  }
                />
              </Form.Item>
            ) : ""
          }

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
        dataSource={data?.results}
        loading={isLoading}
        scroll={{ x: true }}
        pagination={{ showSizeChanger: true }}
      >
        {
          showAccountName && account ? (
            <Table.Column dataIndex="accountName" title="账户" />
          ) : undefined
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
