import { Form, Input } from "antd";
import React from "react";
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
      <Form.Item label="用户ID" name="identityId"
        rules={[
          { pattern: /^[a-z0-9_]+$/, message: "只能由小写英文字符、数字和下划线组成" },
          { required: true },
        ]}
      >
        <Input placeholder="只能由小写英文字符、数字和下划线组成" />
      </Form.Item>
      <Form.Item label="用户姓名" name="name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item label="用户邮箱" name="email"
        rules={[{ required: true }, emailRule]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        rules={[{ required: true }, passwordRule]}
        label="密码"
        name="password"
      >
        <Input.Password placeholder={passwordRule.message} />
      </Form.Item>
      <Form.Item
        name="confirmPassword"
        label="确认密码"
        hasFeedback
        {...confirmPasswordFormItemProps(form, "password")}
      >
        <Input.Password />
      </Form.Item>
    </>
  );
};
