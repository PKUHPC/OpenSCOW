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

import { Form, Input } from "antd";
import React from "react";
import { prefix, useI18n, useI18nTranslateToString } from "src/i18n";
import { getUserIdRule, useBuiltinCreateUser } from "src/utils/createUser";
import { confirmPasswordFormItemProps, emailRule, passwordRule } from "src/utils/form";
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

  const { t } = useI18nTranslateToString();

  const form = Form.useFormInstance<CreateUserFormFields>();

  const userIdRule = getUserIdRule();

  const languageId = useI18n().currentLanguage.id;

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
      <Form.Item label={t(pCommon("userName"))} name="name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item
        label={t(p("email"))}
        name="email"
        rules={[{ required: true }, emailRule]}
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
              {...confirmPasswordFormItemProps(form, "password")}
            >
              <Input.Password placeholder={passwordRule(languageId).message} />
            </Form.Item>
          </>
        ) : undefined

      }
    </>
  );
};
