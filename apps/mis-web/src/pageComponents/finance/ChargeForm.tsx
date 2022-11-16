import { Button, Form, Input, InputNumber, message, notification, Tag } from "antd";
import React, { useState } from "react";
import { useAsync } from "react-async";
import { api } from "src/apis";
import { ClickableA } from "src/components/ClickableA";
import { publicConfig } from "src/utils/config";

interface ChargeFields {
  accountName: string;
  amount: number;
  comment: string;
  type: string;
}

const getTypes = async () => api.getUsedPayTypes({});

const UsedType: React.FC<{ onClick: (type: string) => void }> = ({ onClick }) => {
  const { isLoading, data } = useAsync({ promiseFn: getTypes });

  const createTag = (x: string) => (
    <Tag key={x} onClick={() => onClick(x)}>
      <ClickableA>{x}</ClickableA>
    </Tag>
  );

  return (
    <div>
      {
        publicConfig.PREDEFINED_CHARGING_TYPES.map(createTag)
      }
      {isLoading
        ? "正在加载使用过的类型……"
        : (data ? data.types.filter((x) => x && !publicConfig.PREDEFINED_CHARGING_TYPES.includes(x)) : [])
          .map(createTag)
      }
    </div>
  );

};

export const ChargeForm: React.FC = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm<ChargeFields>();

  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const { accountName, amount, comment, type } = await form.validateFields();

    setLoading(true);

    const hide = messageApi.loading("充值中……", 0);

    // 2. upload the rest
    await api.financePay({
      body: {
        accountName,
        type,
        amount,
        comment,
      },
    })
      .httpError(404, () => {
        message.error("账户未找到");
      })
      .httpError(500, (e) => {
        notification["error"]({
          message: "操作失败",
          description: `多集群操作出现错误, 部分集群未同步修改(${e}), 请联系管理员!`,
          duration: 0,
        });
      })
      .then(() => {
        messageApi.success("充值完成！");
      })
      .finally(() => {
        setLoading(false);
        hide();
      });

  };

  return (
    <Form
      form={form}
      wrapperCol={{ span: 20 }}
      labelCol={{ span: 4 }}
      labelAlign="right"
      onFinish={submit}
    >
      {contextHolder}
      <Form.Item
        name="accountName"
        label="账户"
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>
      <Form.Item name="amount" label="金额" rules={[{ required: true }]}>
        <InputNumber min={0} step={0.01} addonAfter="元" />
      </Form.Item>
      <Form.Item
        name="type"
        label="类型"
        required
        extra={(
          <div style={{ margin: "8px 0" }}>
            <UsedType
              onClick={(type) => form.setFieldsValue({ type })}
            />
          </div>
        )}
      >
        <Input />
      </Form.Item>
      <Form.Item name="comment" label="备注">
        <Input.TextArea />
      </Form.Item>
      <Form.Item wrapperCol={{ span: 6, offset: 4 }}>
        <Button type="primary" htmlType="submit" loading={loading}>
          提交
        </Button>
      </Form.Item>
    </Form>
  );
};
