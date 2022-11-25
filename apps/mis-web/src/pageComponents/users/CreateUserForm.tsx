import { Form, Input } from "antd";
import React from "react";
import { publicConfig } from "src/utils/config";
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
          ...(publicConfig.USERID_PATTERN ? [{
            pattern: new RegExp(publicConfig.USERID_PATTERN),
            message: publicConfig.USERID_PATTERN_MESSAGE }] : []),
        ]}

      >
        <Input placeholder={publicConfig.USERID_PATTERN_MESSAGE} />
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
        publicConfig.ENABLE_CREATE_USER ? (
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
