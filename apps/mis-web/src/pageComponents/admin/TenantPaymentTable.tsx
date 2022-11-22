import { Button, DatePicker, Form, Input, Select, Table } from "antd";
import dayjs from "dayjs";
import { useCallback, useState } from "react";
import { useAsync } from "react-async";
import { api } from "src/apis";
import { FilterFormContainer } from "src/components/FilterFormContainer";
import { defaultPresets, formatDateTime } from "src/utils/datetime";
import { useDidUpdateEffect } from "src/utils/hooks";

interface Props {
  tenantNames?: string[];
  showTenantName: boolean;
  /** IP地址和操作者ID */
  showAuditInfo: boolean;
}

interface FilterForm {
  tenantName?: string;
  time: [dayjs.Dayjs, dayjs.Dayjs],
}

const today = dayjs().endOf("day");

export const TenantPaymentTable: React.FC<Props> = ({
  tenantNames, showTenantName, showAuditInfo,
}) => {

  const [form] = Form.useForm<FilterForm>();

  const [query, setQuery] = useState({
    tenantName: tenantNames?.[0],
    time: [today.clone().subtract(1, "year"), today],
  });

  const { data, isLoading } = useAsync({
    promiseFn: useCallback(async () => {
      return api.getTenantPayments({ query: {
        tenantName: query.tenantName,
        startTime: query.time[0].clone().startOf("day").toISOString(),
        endTime: query.time[1].clone().endOf("day").toISOString(),
      } });
    }, [query]),
  });

  useDidUpdateEffect(() => {
    setQuery((q) => ({ ...q, tenantName: tenantNames?.[0] }));
  }, [tenantNames]);

  return (
    <div>
      <FilterFormContainer>
        <Form<FilterForm>
          layout="inline"
          form={form}
          initialValues={query}
          onFinish={async () => {
            const { tenantName, time } = await form.validateFields();
            setQuery({ tenantName, time });
          }}
        >
          {
            tenantNames
              ? tenantNames.length === 1
                ? undefined
                : (
                  <Form.Item label="租户" name="tenantName">
                    <Select placeholder="选择账户">
                      {tenantNames.map((x) => <Select.Option key={x} value={x}>{x}</Select.Option>)}
                    </Select>
                  </Form.Item>
                )
              : (
                <Form.Item label="租户" name="tenantName">
                  <Input />
                </Form.Item>
              )
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
          showTenantName ? (
            <Table.Column dataIndex="tenantName" title="租户" />
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
