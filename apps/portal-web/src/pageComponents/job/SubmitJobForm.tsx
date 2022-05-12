import { Button, Form, Input, message } from "antd";
import moment from "moment";
import React, {  } from "react";
import { api } from "src/apis";
import { SingleClusterSelector } from "src/components/ClusterSelector";
import { Cluster } from "src/utils/config";

interface JobForm {
  cluster: Cluster;
  command: string;
}

export const SubmitJobForm: React.FC = ({}) => {

  const [form] = Form.useForm<JobForm>();

  const submit = async () => {
    const { cluster, command } = await form.validateFields();

    const { jobId } = await api.submitJob({ body: { cluster: cluster.id, command } });

    message.success("提交成功！您的新作业ID为：" + jobId);
  };

  return (
    <Form<JobForm>
      form={form}
      initialValues={{
        command: "",
        jobName: moment().format("YYYYMMDDHHMMSS"),
      }}
      onFinish={submit}
    >
      <Form.Item label="集群" name="cluster">
        <SingleClusterSelector />
      </Form.Item>
      <Form.Item label="命令" name="command">
        <Input.TextArea autoSize={{ minRows: 8 }} />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">创建</Button>
      </Form.Item>
    </Form>
  );
};
