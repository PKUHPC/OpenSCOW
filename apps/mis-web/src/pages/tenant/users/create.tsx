/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * SCOW is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import { FormLayout } from "@scow/lib-web/build/layouts/FormLayout";
import { App, Button, Form } from "antd";
import { NextPage } from "next";
import React, { useState } from "react";
import { api } from "src/apis";
import { requireAuth } from "src/auth/requireAuth";
import { NotFoundPage } from "src/components/errorPages/NotFoundPage";
import { PageTitle } from "src/components/PageTitle";
import { TenantRole } from "src/models/User";
import { CreateUserForm, CreateUserFormFields } from "src/pageComponents/users/CreateUserForm";
import { publicConfig } from "src/utils/config";
import { Head } from "src/utils/head";

const CreateUserPageForm: React.FC = () => {

  const [form] = Form.useForm<CreateUserFormFields>();
  const { message, modal } = App.useApp();

  const [loading, setLoading] = useState(false);

  const onOk = async () => {
    const { password, email, identityId, name } = await form.validateFields();
    setLoading(true);

    const result = await api.userExists({ body: { identityId } });
    if (result.existsInScow) {
      modal.error({
        title: "用户已存在",
        content: "用户已存在于SCOW数据库，无法再添加此用户",
        okText: "确认",
        onOk: async () => {
          setLoading(false);
        },
      });
    } else {
      modal.confirm({
        title: result.existsInAuth !== undefined ?
          result.existsInAuth ? "用户已存在于认证系统" : "用户未存在于认证系统"
          : "无法确定用户是否存在于认证系统",
        content: result.existsInAuth ?
          "用户已经在认证系统中存在，您此处输入的密码将会不起作用，新用户的密码将是认证系统中的已有用户的当前密码。点击“确认”将会将此用户直接添加到SCOW数据库,"
          : "点击“确认”将会同时在SCOW数据库和认证系统创建此用户",
        okText: "确认",
        onOk: async () => {
          await api.createUser({ body: { email, identityId, name, password } })
            .httpError(409, () => {
              modal.error({
                title: "添加失败",
                content: "此用户存在于scow数据库",
                okText: "确认",
              });
            })
            .then((createdInAuth) => {
              !createdInAuth.createdInAuth ?
                modal.info({
                  title: "添加成功",
                  content: "此用户存在于认证系统中，已成功添加到SCOW数据库",
                  okText: "确认",
                })
                : message.success("添加完成！"); })
            .catch(() => {
              modal.error({
                title: "添加失败",
                content: "创建用户失败",
              });
            })
            .finally(() => {
              form.resetFields();
              setLoading(false);
            });
        },
        onCancel: async () => {
          setLoading(false);
        },
      });
    }
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
