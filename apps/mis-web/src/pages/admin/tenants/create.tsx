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
import { PageTitle } from "src/components/PageTitle";
import { PlatformRole } from "src/models/User";
import { CreateTenantForm, CreateTenantFormFields } from "src/pageComponents/admin/CreateTenantForm";
import { useBuiltinCreateUser } from "src/utils/createUser";
import { Head } from "src/utils/head";

const CreateTenantPageForm: React.FC = () => {

  const [form] = Form.useForm<CreateTenantFormFields>();
  const { message, modal } = App.useApp();

  const [loading, setLoading] = useState(false);

  const onOk = async () => {
    const { tenantName, userId, userName, userEmail, userPassword } = await form.validateFields();
    setLoading(true);

    const result = await api.userExists({ body: { identityId: userId } });
    if (result.existsInScow) {
      modal.error({
        title: "管理员用户已存在",
        content: "管理员用户已存在于SCOW数据库，无法再添加此用户",
        okText: "确认",
        onOk: async () => {
          setLoading(false);
        },
      });
    } else if (!result.existsInAuth && result.existsInAuth !== undefined && !useBuiltinCreateUser()) {
      // 用户不不存在于scow,且认证系统支持查询，且查询结果不存在于认证系统，且当前系统不支持内置创建用户
      modal.confirm({
        title: "管理员用户不存在于认证系统",
        content: "管理员用户不存在，请确认管理员用户ID是否正确",
        okText: "确认",
        onOk: async () => {
          setLoading(false);
        },
        onCancel: async () => {
          setLoading(false);
        },
      });
    } else {
      modal.confirm({
        title: "提示",
        content: result.existsInAuth !== undefined ?
          // 认证系统支持查询
          result.existsInAuth ? "管理员用户已经在认证系统中存在，您此处输入的密码将会不起作用，新用户的密码将是认证系统中的已有用户的当前密码。确认添加为新建租户管理员？"
            : "管理员用户不存在于认证系统，是否确认创建此用户并添加为新建租户管理员？"
          : // 认证系统不支持查询
          useBuiltinCreateUser() ?
            " 无法确认管理员用户是否在认证系统中存在， 将会尝试在认证系统中创建。如果用户已经在认证系统中存在，您此处输入的密码将会不起作用，新用户的密码将是认证系统中的已有用户的当前密码"
            : "无法确认管理员用户是否在认证系统中存在，并且当前认证系统不支持创建用户，请您确认此用户已经在认证系统中存在，确认将会直接加入到数据库中"
            + ", 并且您此处输入的密码将不会起作用，新用户的密码将是认证系统中的已有用户的当前密码。",

        okText: "确认",
        onOk: async () => {
          await api.createTenant({
            body: {
              tenantName,
              userId,
              userName,
              userEmail,
              userPassword,
            },
          }).httpError(409, (e) => {
            modal.error({
              title: "添加失败",
              content: `此${e.code === "TENANT_ALREADY_EXISTS" ? "租户" : "用户"}已存在于scow数据库`,
              okText: "确认",
            });
          })
            .then((createdInAuth) => {
              !createdInAuth.createdInAuth ?
                modal.info({
                  title: "添加成功",
                  content: "租户创建成功，且管理员用户存在于认证系统中，已成功添加到SCOW数据库",
                  okText: "确认",
                })
                : message.success("添加完成！");
            })
            .catch(() => {
              modal.error({
                title: "添加失败",
                content: "创建租户失败",
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
      labelAlign="left"
      onFinish={onOk}
    >
      <CreateTenantForm />
      <Form.Item wrapperCol={{ span: 6, offset: 4 }}>
        <Button type="primary" htmlType="submit" loading={loading}>
          提交
        </Button>
      </Form.Item>
    </Form>
  );
};

export const CreateTenantPage: NextPage = requireAuth((i) => i.tenantRoles.includes(PlatformRole.PLATFORM_ADMIN))(
  () => {
    return (
      <div>
        <Head title="创建租户" />
        <PageTitle titleText="创建租户" />
        <FormLayout>
          <CreateTenantPageForm />
        </FormLayout>
      </div>
    );
  });

export default CreateTenantPage;
