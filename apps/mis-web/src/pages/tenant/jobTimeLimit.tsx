import { Button, Form, Input, InputNumber, message, Select } from "antd";
import { NextPage } from "next";
import React, { useState } from "react";
import { api } from "src/apis";
import { requireAuth } from "src/auth/requireAuth";
import { SingleClusterSelector } from "src/components/ClusterSelector";
import { DisabledA } from "src/components/DisabledA";
import { PageTitle } from "src/components/PageTitle";
import { FormLayout } from "src/layouts/FormLayout";
import { TenantRole } from "src/models/User";
import { Cluster } from "src/utils/config";
import { Head } from "src/utils/head";

const changeModeText = {
  INCREASE: "增加",
  DECREASE: "减少",
};

type ChangeMode = keyof typeof changeModeText;

interface FormProps {
  jobId: number;
  cluster: Cluster;
  mode: ChangeMode;
  value: number;
}

const StorageForm: React.FC = () => {

  const [form] = Form.useForm<FormProps>();

  const [loading, setLoading] = useState(false);

  const [current, setCurrent] = useState<number | undefined>(undefined);
  const [currentLoading, setCurrentLoading] = useState(false);

  const submit = async () => {
    const { value, jobId, cluster, mode } = await form.validateFields();
    setLoading(true);

    const delta = mode === "DECREASE" ? -value : value;

    await api.changeJobTimeLimit({ body: { jobId: jobId + "", cluster: cluster.id, delta } })
      .httpError(403, () => { message.error("您不可以修改这个作业的剩余时间。"); })
      .httpError(404, () => { message.error("作业未找到"); })
      .then(() => {
        message.success("修改成功！");
        queryCurrent();
      })
      .finally(() => setLoading(false));
  };

  const queryCurrent = async () => {
    const cluster = form.getFieldValue("cluster") as Cluster;
    const jobId = form.getFieldValue("jobId");
    if (!cluster || !jobId) {
      message.error("请输入作业ID和集群");
      return;
    }
    setCurrentLoading(true);
    await api.queryJobTimeLimit({ query: { cluster: cluster.id, jobId } })
      .httpError(403, () => { message.error("您不可以查询这个作业的剩余时间。"); })
      .httpError(404, () => { message.error("作业未找到"); })
      .then(({ result }) => {
        setCurrent(result);
      })
      .finally(() => setCurrentLoading(false));
  };

  return (
    <Form
      form={form}
      wrapperCol={{ span: 18 }}
      labelCol={{ span: 6 }}
      labelAlign="right"
      onFinish={submit}
      initialValues={{ mode: "INCREASE", value: 1 }}
    >
      <Form.Item
        name="cluster"
        label="集群"
        rules={[{ required: true }]}
      >
        <SingleClusterSelector />
      </Form.Item>
      <Form.Item
        name="jobId"
        label="作业ID"
        rules={[{ required: true }]}
      >
        <InputNumber style={{ minWidth: "160px" }} min={1} />
      </Form.Item>
      <Form.Item label="当前作业时间限制">
        <DisabledA onClick={queryCurrent} disabled={currentLoading}>
          {
            currentLoading
              ? "查询中……"
              : current === undefined
                ? "请点击查询"
                : `${Math.floor(current / 60)} 分钟${current % 60 === 0 ? "" : ` ${current % 60}秒`}`
          }
        </DisabledA>
      </Form.Item>
      <Form.Item<FormProps> label="时间变化" rules={[{ required: true }]}>
        <Input.Group compact>
          <Form.Item name="mode" noStyle>
            <Select placeholder="选择设置为">
              {Object.entries(changeModeText).map(([key, value]) => (
                <Select.Option value={key} key={key}>{value}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="value" noStyle>
            <InputNumber min={1} step={1} addonAfter={"分钟"} />
          </Form.Item>
        </Input.Group>
      </Form.Item>
      <Form.Item wrapperCol={{ span: 8, offset: 6 }}>
        <Button type="primary" htmlType="submit" loading={loading}>
          提交
        </Button>
      </Form.Item>
    </Form>
  );
};

export const ChangeJobTimeLimitPage: NextPage = requireAuth(
  (i) => i.tenantRoles.includes(TenantRole.TENANT_ADMIN))
(() => {
  return (
    <div>
      <Head title="调整作业执行时间" />
      <PageTitle titleText="调整作业执行时间" />
      <FormLayout>
        <StorageForm />
      </FormLayout>
    </div>
  );
});

export default ChangeJobTimeLimitPage;
