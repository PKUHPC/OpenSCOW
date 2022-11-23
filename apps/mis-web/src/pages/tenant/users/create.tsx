import { Button, Form } from "antd";
import { NextPage } from "next";
import React, { useState } from "react";
import { api } from "src/apis";
import { requireAuth } from "src/auth/requireAuth";
import { NotFoundPage } from "src/components/errorPages/NotFoundPage";
import { PageTitle } from "src/components/PageTitle";
import { FormLayout } from "src/layouts/FormLayout";
import { useMessage } from "src/layouts/prompts";
import { TenantRole } from "src/models/User";
import { CreateUserForm, CreateUserFormFields } from "src/pageComponents/users/CreateUserForm";
import { publicConfig } from "src/utils/config";
import { Head } from "src/utils/head";

const CreateUserPageForm: React.FC = () => {

  const [form] = Form.useForm<CreateUserFormFields>();
  const message = useMessage();

  const [loading, setLoading] = useState(false);

  const onOk = async () => {
    const { password, email, identityId, name } = await form.validateFields();
    setLoading(true);

    await api.createUser({ body: { email, identityId, name, password } })
      .httpError(409, () => { message.error("此用户ID已经存在！"); })
      .then(() => {
        message.success("用户创建完成");
      }).finally(() => {
        setLoading(false);
      });
  };

  return (
    <Form
      form={form}
      wrapperCol={{ span: 20 }}
      labelCol={{ span: 4 }}
      labelAlign="right"
      onFinish={onOk}
    >
      <CreateUserForm />
      <Form.Item wrapperCol={{ span: 6, offset: 4 }}>
        <Button type="primary" htmlType="submit" loading={loading}>
          提交
        </Button>
      </Form.Item>
    </Form>
  );
};

export const CreateUserPage: NextPage = requireAuth((i) => i.tenantRoles.includes(TenantRole.TENANT_ADMIN))(
  () => {

    if (!publicConfig.ENABLE_CREATE_USER) {
      return <NotFoundPage />;
    }

    return (
      <div>
        <Head title="创建用户" />
        <PageTitle titleText="创建用户" />
        <FormLayout>
          <CreateUserPageForm />
        </FormLayout>
      </div>
    );
  });

export default CreateUserPage;
