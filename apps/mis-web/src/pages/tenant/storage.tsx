import { Button, Form, Input, InputNumber, Select } from "antd";
import { NextPage } from "next";
import React, { useState } from "react";
import { useStore } from "simstate";
import { api } from "src/apis";
import { requireAuth } from "src/auth/requireAuth";
import { SingleClusterSelector } from "src/components/ClusterSelector";
import { DisabledA } from "src/components/DisabledA";
import { PageTitle } from "src/components/PageTitle";
import { FormLayout } from "src/layouts/FormLayout";
import { useMessage } from "src/layouts/prompts";
import { TenantRole } from "src/models/User";
import type { ChangeStorageMode } from "src/pages/api/admin/changeStorage";
import { DefaultClusterStore } from "src/stores/DefaultClusterStore";
import { Cluster } from "src/utils/config";
import { Head } from "src/utils/head";

const changeModeText = {
  INCREASE: "增加",
  DECREASE: "减少",
  SET: "设置为",
};

interface FormProps {
  mode: ChangeStorageMode;
  userId: string;
  cluster: Cluster;
  value: number;
}

const StorageForm: React.FC = () => {

  const [form] = Form.useForm<FormProps>();

  const [loading, setLoading] = useState(false);

  const [current, setCurent] = useState<number | undefined>(undefined);
  const [currentLoading, setCurrentLoading] = useState(false);

  const defaultClusterStore = useStore(DefaultClusterStore);
  
  const message = useMessage();

  const submit = async () => {
    const { value, userId, cluster, mode } = await form.validateFields();
    setLoading(true);

    await api.changeStorageQuota({ body: { value, userId, cluster: cluster.id, mode } })
      .httpError(404, () => { message.error("用户未找到"); })
      .httpError(400, () => { message.error("余额变化不合法。"); })
      .then(({ currentQuota }) => {
        message.success("修改成功！");
        setCurent(currentQuota);
      })
      .finally(() => setLoading(false));
  };

  const queryCurrent = async () => {
    const cluster = form.getFieldValue("cluster") as Cluster;
    const userId = form.getFieldValue("userId");
    if (!cluster || !userId) {
      message.error("请输入用户ID和集群");
      return;
    }
    setCurrentLoading(true);
    await api.queryStorageQuota({ query: { cluster: cluster.id, userId } })
      .httpError(404, () => { message.error("用户未找到"); })
      .then(({ currentQuota }) => {
        setCurent(currentQuota);
      })
      .finally(() => setCurrentLoading(false));
  };

  return (
    <Form
      form={form}
      wrapperCol={{ span: 20 }}
      labelCol={{ span: 4 }}
      labelAlign="right"
      onFinish={submit}
      initialValues={{ mode: "SET", value: 1 }}
    >
      <Form.Item
        name="userId"
        label="用户ID"
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="cluster"
        label="集群"
        rules={[{ required: true }]}
        initialValue={defaultClusterStore.cluster}
      >
        <SingleClusterSelector />
      </Form.Item>
      <Form.Item label="当前空间">
        <DisabledA onClick={queryCurrent} disabled={currentLoading}>
          {
            currentLoading
              ? "查询中……"
              : current === undefined
                ? "请点击查询"
                : `${current} TB`
          }
        </DisabledA>
      </Form.Item>
      <Form.Item<FormProps> label="存储变化" rules={[{ required: true }]}>
        <Input.Group compact>
          <Form.Item name="mode" noStyle>
            <Select placeholder="选择设置为">
              {Object.entries(changeModeText).map(([key, value]) => (
                <Select.Option value={key} key={key}>{value}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="value" noStyle>
            <InputNumber min={1} step={1} addonAfter={"TB"} />
          </Form.Item>
        </Input.Group>
      </Form.Item>
      <Form.Item wrapperCol={{ span: 6, offset: 4 }}>
        <Button type="primary" htmlType="submit" loading={loading}>
          提交
        </Button>
      </Form.Item>
    </Form>
  );
};

export const AdminStoragePage: NextPage = requireAuth((i) => i.tenantRoles.includes(TenantRole.TENANT_ADMIN))(
  () => {
    return (
      <div>
        <Head title="调整用户存储空间" />
        <PageTitle titleText="调整用户存储空间" />
        <FormLayout>
          <StorageForm />
        </FormLayout>
      </div>
    );
  });

export default AdminStoragePage;
