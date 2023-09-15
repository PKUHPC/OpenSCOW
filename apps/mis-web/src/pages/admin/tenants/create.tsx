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
import { prefix, useI18nTranslate, useI18nTranslateToString } from "src/i18n";
import { PlatformRole } from "src/models/User";
import { CreateTenantForm, CreateTenantFormFields } from "src/pageComponents/admin/CreateTenantForm";
import { useBuiltinCreateUser } from "src/utils/createUser";
import { Head } from "src/utils/head";

const p = prefix("page.admin.tenants.create.");

const CreateTenantPageForm: React.FC = () => {

  const [form] = Form.useForm<CreateTenantFormFields>();
  const { message, modal } = App.useApp();

  const [loading, setLoading] = useState(false);
  const { t } = useI18nTranslateToString();
  const { tArgs } = useI18nTranslate();

  const onOk = async () => {
    const { tenantName, userId, userName, userEmail, userPassword } = await form.validateFields();
    setLoading(true);

    const result = await api.userExists({ body: { identityId: userId } });
    if (result.existsInScow) {
      modal.error({
        title: t(p("adminExist")),
        content: t(p("adminExistMessage")),
        okText: t("common.ok"),
        onOk: async () => {
          setLoading(false);
        },
      });
    } else if (!result.existsInAuth && result.existsInAuth !== undefined && !useBuiltinCreateUser()) {
      // 用户不不存在于scow,且认证系统支持查询，且查询结果不存在于认证系统，且当前系统不支持内置创建用户
      modal.confirm({
        title: t(p("adminNotExistAuth")),
        content: t(p("adminNotExistAuthMessage")),
        okText: t("common.ok"),
        onOk: async () => {
          setLoading(false);
        },
        onCancel: async () => {
          setLoading(false);
        },
      });
    } else {
      modal.confirm({
        title: t("common.prompt"),
        content: result.existsInAuth !== undefined ?
          // 认证系统支持查询
          result.existsInAuth ? t(p("adminExistAuthMessage"))
            : t(p("adminNotExistAuthAndConfirmCreateMessage"))
          : // 认证系统不支持查询
          useBuiltinCreateUser() ?
            t(p("unableConfirmAdminExistInAuthMessage"))
            : t(p("unableConfirmAdminExistInAuthAndUnableCreateMessage")),

        okText: t("common.ok"),
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
              title: t("common.addFail"),
              content: tArgs(p("existInSCOWDatabase"),
                [e.code === "TENANT_ALREADY_EXISTS" ? t("common.tenant") : t("common.user")]),
              okText: t("common.ok"),
            });
          })
            .then((createdInAuth) => {
              !createdInAuth.createdInAuth ?
                modal.info({
                  title: t("common.addSuccess"),
                  content: t(p("createTenantSuccessMessage")),
                  okText: t("common.ok"),
                })
                : message.success(t(p("addCompleted")));
            })
            .catch(() => {
              modal.error({
                title: t("common.addFail"),
                content: t(p("createTenantFailMessage")),
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
          {t("common.submit")}
        </Button>
      </Form.Item>
    </Form>
  );
};

export const CreateTenantPage: NextPage = requireAuth((i) => i.tenantRoles.includes(PlatformRole.PLATFORM_ADMIN))(
  () => {
    const { t } = useI18nTranslateToString();

    return (
      <div>
        <Head title={t(p("createTenant"))} />
        <PageTitle titleText={t(p("createTenant"))} />
        <FormLayout>
          <CreateTenantPageForm />
        </FormLayout>
      </div>
    );
  });

export default CreateTenantPage;
