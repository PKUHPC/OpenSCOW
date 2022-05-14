import { Button, Form, Input, message, Modal } from "antd";
import moment from "moment";
import React, { useState } from "react";
import { api } from "src/apis";
import { SingleClusterSelector } from "src/components/ClusterSelector";
import { Editor } from "src/components/Editor";
import { Cluster, CLUSTERS } from "src/utils/config";

interface JobForm {
  cluster: Cluster;
  command: string;
  jobName: string;
}

export const SubmitJobForm: React.FC = ({}) => {

  const [form] = Form.useForm<JobForm>();
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const { cluster, command, jobName } = await form.validateFields();

    setLoading(true);

    await api.submitJob({ body: { cluster: cluster.id, command, jobName } })
      .httpError(409, ({ output }) => {
        Modal.error({
          title: "提交作业失败",
          content: output,
        });
      })
      .then(({ jobId }) => {
        message.success("提交成功！您的新作业ID为：" + jobId);
      })
      .finally(() => setLoading(false));
  };

  return (
    <Form<JobForm>
      form={form}
      initialValues={{
        cluster: CLUSTERS[0],
        command: "",
        jobName: moment().format("YYYYMMDDhhmmss"),
      }}
      onFinish={submit}
    >
      <Form.Item label="集群" name="cluster" rules={[{ required: true }]}>
        <SingleClusterSelector />
      </Form.Item>
      <Form.Item label="作业名" name="jobName" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item label="命令" name="command" rules={[{ required: true }]}>
        <Editor language="shell" height="50vh" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          提交
        </Button>
      </Form.Item>
    </Form>
  );
};
