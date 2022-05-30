import { AppServer } from "@scow/config/build/appConfig/appServer";
import { Button, Form, message } from "antd";
import { useState } from "react";
import { api } from "src/apis";
import { SingleClusterSelector } from "src/components/ClusterSelector";
import { Cluster } from "src/utils/config";

interface Props {
  config: AppServer;
}

interface FormFields {
  cluster: Cluster;
}

export const LaunchAppForm: React.FC<Props> = ({ config }) => {

  const [form] = Form.useForm<FormFields>();
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    const { cluster } = await form.validateFields();

    setLoading(true);

    await api.createApp({ body: { cluster: cluster.id, appId: config.id } })
      .then(() => {
        message.success("创建成功！");
      }).finally(() => {
        setLoading(false);
      });
  };

  return (
    <Form form={form} onFinish={onSubmit}>
      <Form.Item name="cluster" label="集群" rules={[{ required: true }]}>
        <SingleClusterSelector />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          提交
        </Button>
      </Form.Item>
    </Form>
  );
};
