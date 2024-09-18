/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * OpenSCOW is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import { Form, Input } from "antd";
import React from "react";
import { prefix, useI18n, useI18nTranslateToString } from "src/i18n";
import { getUserIdRule, useBuiltinCreateUser } from "src/utils/createUser";
import { confirmPasswordFormItemProps, getEmailRule, passwordRule } from "src/utils/form";
export interface CreateUserFormFields {
  identityId: string;
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const p = prefix("pageComp.user.createUserForm.");
const pCommon = prefix("common.");

export const CreateUserForm: React.FC = () => {

  const t = useI18nTranslateToString();

  const form = Form.useFormInstance<CreateUserFormFields>();

  const languageId = useI18n().currentLanguage.id;
  const userIdRule = getUserIdRule(languageId);

  return (
    <>
      <Form.Item
        label={t(pCommon("userId"))}
        name="identityId"
        rules={[
          { required: true },
          ...userIdRule ? [userIdRule] : [],
        ]}

      >
        <Input placeholder={userIdRule?.message} />
      </Form.Item>
      <Form.Item
        label={t(pCommon("userFullName"))}
        name="name"
        rules={[
          { required: true },
          { max: 50 },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label={t(p("email"))}
        name="email"
        rules={[{ required: true }, getEmailRule(languageId)]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label={t(p("password"))}
        name="password"
        rules={[{ required:true }, passwordRule(languageId)]}
      >
        <Input.Password placeholder={passwordRule(languageId).message} />
      </Form.Item>
      {
        useBuiltinCreateUser() ? (
          <>
            <Form.Item
              label={t(p("confirm"))}
              name="confirmPassword"
              hasFeedback
              {...confirmPasswordFormItemProps(form, "password", languageId)}
            >
              <Input.Password placeholder={passwordRule(languageId).message} />
            </Form.Item>
          </>
        ) : undefined

      }
    </>
  );
};
