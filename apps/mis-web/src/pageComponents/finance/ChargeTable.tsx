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
import { prefix, useI18nTranslateToString } from "src/i18n";

interface Props {
  accountName: string;
  showAccountName: boolean;
}

interface FilterForm {
  time: [dayjs.Dayjs, dayjs.Dayjs];
}

const today = dayjs().endOf("day");

const p = prefix("pageComp.finance.chargeTable.");
const pCommon = prefix("pageComp.common.");

export const ChargeTable: React.FC<Props> = ({ accountName, showAccountName }) => {

  const { t } = useI18nTranslateToString();

  const [form] = Form.useForm<FilterForm>();

  const [query, setQuery] = useState({
    time: [today.clone().subtract(1, "year"), today],
  });

  const { data, isLoading } = useAsync({
    promiseFn: useCallback(async () => {
      return api.getCharges({ query: {
        accountName,
        startTime: query.time[0].clone().startOf("day").toISOString(),
        endTime: query.time[1].clone().endOf("day").toISOString(),
      } });
    }, [query]),
  });

  useDidUpdateEffect(() => {
    setQuery((q) => ({ ...q, accountName }));
  }, [accountName]);

  return (
    <div>
      <FilterFormContainer>
        <Form<FilterForm>
          layout="inline"
          form={form}
          initialValues={query}
          onFinish={async () => {
            const { time } = await form.validateFields();
            setQuery({ time });
          }}
        >
          <Form.Item label={t(pCommon("time"))} name="time">
            <DatePicker.RangePicker allowClear={false} presets={defaultPresets} />
          </Form.Item>
          <Form.Item label={t(pCommon("total"))}>
            <strong>
              {data ? data.results.length : 0}
            </strong>
          </Form.Item>
          <Form.Item label={t(pCommon("sum"))}>
            <strong>
              {data ? data.total.toFixed(3) : 0}
            </strong>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">{t(pCommon("search"))}</Button>
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
            <Table.Column dataIndex="accountName" title={t(pCommon("account"))} />
          )
        }
        <Table.Column dataIndex="time" title={t(p("time"))} render={(v) => formatDateTime(v)} />
        <Table.Column dataIndex="amount" title={t(p("amount"))} render={(v) => v.toFixed(3)} />
        <Table.Column dataIndex="type" title={t(pCommon("type"))} />
        <Table.Column dataIndex="comment" title={t(pCommon("comment"))} />
      </Table>
    </div>

  );
};
