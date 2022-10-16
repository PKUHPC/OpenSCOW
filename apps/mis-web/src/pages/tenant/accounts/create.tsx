import { Button, Form, Input, message } from "antd";
import { NextPage } from "next";
import React, { useState } from "react";
import { api } from "src/apis";
import { requireAuth } from "src/auth/requireAuth";
import { PageTitle } from "src/components/PageTitle";
import { FormLayout } from "src/layouts/FormLayout";
import { TenantRole } from "src/models/User";
import { publicConfig } from "src/utils/config";
import { Head } from "src/utils/head";

interface FormProps {
  ownerId: string;
  ownerName: string;
  accountName: string;
  comment: string;
}

const accountNameRegex = publicConfig.ACCOUNT_NAME_PATTERN ? new RegExp(publicConfig.ACCOUNT_NAME_PATTERN) : undefined;

const CreateAccountForm: React.FC = () => {

  const [form] = Form.useForm<FormProps>();

  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const { accountName, ownerId, ownerName, comment } = await form.validateFields();
    setLoading(true);

    await api.createAccount({ body: { accountName, ownerId, ownerName, comment } })
      .httpError(404, () => { message.error(`用户${ownerId}不存在。`); })
      .httpError(409, () => { message.error("账户名已经被占用"); })
      .httpError(400, () => { message.error("用户ID和名字不匹配。"); })
      .then(() => {
        message.success("创建成功！");
      })
      .finally(() => setLoading(false));
  };

  return (
    <Form
      form={form}
      wrapperCol={{ span: 20 }}
      labelCol={{ span: 4 }}
      labelAlign="right"
      onFinish={submit}
    >
      <Form.Item
        name="accountName"
        label="账户名"
        rules={[
          { required: true },
          { pattern: /^[a-z0-9_]+$/, message: "只能由小写英文字符、数字和下划线组成" },
          ...accountNameRegex
            ? [{
              pattern: accountNameRegex,
              message: publicConfig.ACCOUNT_NAME_PATTERN_MESSAGE }]
            : [],
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="ownerId"
        label="拥有者用户ID"
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="ownerName"
        label="拥有者姓名"
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>
      <Form.Item<FormProps> name="comment" label="备注" required>
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

export const CreateAccountPage: NextPage = requireAuth((i) => i.tenantRoles.includes(TenantRole.TENANT_ADMIN))(
  () => {
    return (
      <div>
        <Head title="创建账户" />
        <PageTitle titleText="创建账户" />
        <FormLayout>
          <CreateAccountForm />
        </FormLayout>
      </div>
    );
  });

export default CreateAccountPage;
