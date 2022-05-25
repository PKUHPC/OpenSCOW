import { Button, DatePicker,Form, Input, Select, Table } from "antd";
import { useForm } from "antd/lib/form/Form";
import moment from "moment";
import { useCallback, useState } from "react";
import { useAsync } from "react-async";
import { api } from "src/apis";
import { FilterFormContainer } from "src/components/FilterFormContainer";
import { defaultRanges, formatDateTime } from "src/utils/datetime";
import { useDidUpdateEffect } from "src/utils/hooks";

interface Props {
  accountNames?: string[];
  showAccountName: boolean;
  /** IP地址和操作者ID */
  showAuditInfo: boolean;
}

interface FilterForm {
  accountName?: string;
  time: [moment.Moment, moment.Moment],
}

const today = moment().endOf("day");

export const PaymentTable: React.FC<Props> = ({
  accountNames, showAccountName, showAuditInfo,
}) => {

  const [form] = useForm<FilterForm>();

  const [query, setQuery] = useState({
    accountName: accountNames?.[0],
    time: [today.clone().subtract(1, "year"), today],
  });

  const { data, isLoading } = useAsync({
    promiseFn: useCallback(async () => {
      return api.getPayments({ query: {
        accountName: query.accountName,
        startTime: query.time[0].clone().startOf("day").toISOString(),
        endTime: query.time[1].clone().endOf("day").toISOString(),
      } });
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
            setQuery({ accountName, time });
          }}
        >
          {
            accountNames
              ? accountNames.length === 1
                ? undefined
                : (
                  <Form.Item label="账户" name="accountName">
                    <Select placeholder="选择账户">
                      {accountNames.map((x) => <Select.Option key={x} value={x}>{x}</Select.Option>)}
                    </Select>
                  </Form.Item>
                )
              : (
                <Form.Item label="账户" name="accountName">
                  <Input />
                </Form.Item>
              )
          }
          <Form.Item label="时间" name="time">
            <DatePicker.RangePicker allowClear={false} ranges={defaultRanges()} />
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
          showAccountName ? (
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
