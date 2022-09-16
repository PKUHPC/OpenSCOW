import { Button, Checkbox, Form, message } from "antd";
import { useState } from "react";
import { api } from "src/apis";
import { CodeEditor } from "src/components/CodeEditor";

interface FormInfo {
  data: string;
  whitelist: boolean;
}

const initialData: FormInfo = {
  data: "",
  whitelist: false,
};

export const ImportUsersForm: React.FC = () => {

  const [form] = Form.useForm<FormInfo>();

  const [loading, setLoading] = useState(false);

  const onFinish = async () => {
    const { data, whitelist } = await form.validateFields();

    setLoading(true);

    await api.importUsers({ body: { data, whitelist } })
      .httpError(400, () => { message.error("数据格式不正确"); })
      .then(() => { message.success("导入成功！"); })
      .finally(() => { setLoading(false); });
  };

  return (
    <Form form={form} initialValues={initialData} onFinish={onFinish}>
      <Form.Item name="data" label="数据" rules={[{ required: true }]}>
        <CodeEditor height="50vh" />
      </Form.Item>
      <Form.Item name="whitelist" valuePropName="checked">
        <Checkbox>将所有账户加入白名单</Checkbox>
      </Form.Item>
      <Button type="primary" htmlType="submit" loading={loading}>
          提交
      </Button>
    </Form>
  );
};

