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
import { useBuiltinCreateUser, userIdRule } from "src/utils/createUser";
import { confirmPasswordFormItemProps, emailRule, passwordRule } from "src/utils/form";
export interface CreateUserFormFields {
  identityId: string;
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}



export const CreateUserForm: React.FC = () => {

  const form = Form.useFormInstance<CreateUserFormFields>();

  return (
    <>
      <Form.Item
        label="用户ID"
        name="identityId"
        rules={[
          { required: true },
          ...userIdRule ? [userIdRule] : [],
        ]}

      >
        <Input placeholder={userIdRule?.message} />
      </Form.Item>
      <Form.Item label="用户姓名" name="name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item
        label="用户邮箱"
        name="email"
        rules={[{ required: true }, emailRule]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="用户密码"
        name="password"
        rules={[{ required:true }, passwordRule]}
      >
        <Input.Password placeholder={passwordRule.message} />
      </Form.Item>
      {
        useBuiltinCreateUser() ? (
          <>
            <Form.Item
              label="确认密码"
              name="confirmPassword"
              hasFeedback
              {...confirmPasswordFormItemProps(form, "password")}
            >
              <Input.Password placeholder={passwordRule.message} />
            </Form.Item>
          </>
        ) : undefined

      }
    </>
  );
};
