import { Button, DatePicker, Form, Table } from "antd";
import dayjs from "dayjs";
import { useCallback, useState } from "react";
import { useAsync } from "react-async";
import { api } from "src/apis";
import { FilterFormContainer } from "src/components/FilterFormContainer";
import { defaultPresets, formatDateTime } from "src/utils/datetime";
import { useDidUpdateEffect } from "src/utils/hooks";

interface Props {
  accountName: string;
  showAccountName: boolean;
}

interface FilterForm {
  time: [dayjs.Dayjs, dayjs.Dayjs];
}

const today = dayjs().endOf("day");

export const ChargeTable: React.FC<Props> = ({ accountName, showAccountName }) => {

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
          showAccountName && (
            <Table.Column dataIndex="accountName" title="账户" />
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
