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

import { Divider, Form, Input } from "antd";
import React from "react";
import { prefix, useI18n, useI18nTranslateToString } from "src/i18n";
import { getUserIdRule, useBuiltinCreateUser } from "src/utils/createUser";
import { confirmPasswordFormItemProps, emailRule, passwordRule } from "src/utils/form";
export interface CreateTenantFormFields {
  tenantName: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPassword: string;
  userConfirmPassword: string;
}

const p = prefix("pageComp.admin.createTenantForm.");
const pCommon = prefix("common.");

export const CreateTenantForm: React.FC = () => {

  const { t } = useI18nTranslateToString();

  const form = Form.useFormInstance<CreateTenantFormFields>();

  const userIdRule = getUserIdRule();

  const languageId = useI18n().currentLanguage.id;

  return (
    <>
      <Divider
        style={{ marginTop: 0 }}
        orientation="left"
        orientationMargin="0"
        plain
      >{t(p("prompt"))}</Divider>
      <Form.Item
        label={t(pCommon("tenantName"))}
        name="tenantName"
        rules={[
          { required: true },
        ]}
      >
        <Input />
      </Form.Item>
      <Divider orientation="left" orientationMargin="0" plain>{t(p("adminInfo"))}</Divider>
      <Form.Item
        label={t(pCommon("userId"))}
        name="userId"
        rules={[
          { required: true },
          ...userIdRule ? [userIdRule] : [],
        ]}
      >
        <Input placeholder={userIdRule?.message} />
      </Form.Item>
      <Form.Item label={t(pCommon("userName"))} name="userName" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item
        label={t(p("userEmail"))}
        name="userEmail"
        rules={[{ required: true }, emailRule]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label={t(p("userPassword"))}
        name="userPassword"
        rules={[{ required: true }, passwordRule(languageId)]}
      >
        <Input.Password placeholder={passwordRule(languageId).message} />
      </Form.Item>
      {
        useBuiltinCreateUser() ? (
          <>
            <Form.Item
              label={t(p("confirmPassword"))}
              name="confirmPassword"
              hasFeedback
              {...confirmPasswordFormItemProps(form, "userPassword")}
            >
              <Input.Password placeholder={passwordRule(languageId).message} />
            </Form.Item>
          </>
        ) : undefined
      }
    </>
  );
};
