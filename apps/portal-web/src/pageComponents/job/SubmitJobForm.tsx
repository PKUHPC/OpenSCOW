import { ReloadOutlined } from "@ant-design/icons";
import { Button, Col, Form, message, Modal, Row, Tooltip } from "antd";
import moment from "moment";
import React, { useState } from "react";
import { api } from "src/apis";
import { SingleClusterSelector } from "src/components/ClusterSelector";
import { Editor } from "src/components/Editor";
import { InputGroupFormItem } from "src/components/InputGroupFormItem";
import { Cluster, CLUSTERS } from "src/utils/config";

interface JobForm {
  cluster: Cluster;
  command: string;
  jobName: string;
}

function genJobName() {
  return moment().format("YYYYMMDDhhmmss");
}

export const SubmitJobForm: React.FC = ({}) => {

  const [form] = Form.useForm<JobForm>();
  const [loading, setLoading] = useState(false);

  const reloadJobName = () => {
    form.setFieldsValue({ jobName: genJobName() });
  };

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
        reloadJobName();
      })
      .finally(() => setLoading(false));
  };


  return (
    <Form<JobForm>
      form={form}
      initialValues={{
        cluster: CLUSTERS[0],
        command: "",
        jobName: genJobName(),
      }}
      onFinish={submit}
    >
      <Row gutter={4}>
        <Col span={24} sm={12}>
          <Form.Item label="集群" name="cluster" rules={[{ required: true }]}>
            <SingleClusterSelector />
          </Form.Item>
        </Col>
        <Col span={24} sm={12}>
          <Form.Item label="作业名" name="jobName" rules={[{ required: true }]}>
            <InputGroupFormItem deltaWidth="32px">
              <Tooltip title="重新生成作业名">
                <Button icon={<ReloadOutlined />} onClick={reloadJobName} />
              </Tooltip>
            </InputGroupFormItem>
          </Form.Item>
        </Col>
      </Row>
      <Form.Item label="命令" name="command" rules={[{ required: true }]}>
        <Editor height="50vh" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          提交
        </Button>
      </Form.Item>
    </Form>
  );
};
