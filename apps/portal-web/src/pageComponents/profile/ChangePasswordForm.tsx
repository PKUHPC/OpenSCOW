import { Button, Form, Input, message, Spin } from "antd";
import React, { useState } from "react";
import { api } from "src/apis";
import { confirmPasswordFormItemProps, passwordRule } from "src/utils/form";

interface FormProps {
  oldPassword: string;
  newPassword: string;
  confirm: string;
}

export const ChangePasswordForm: React.FC = () => {

  const [form] = Form.useForm<FormProps>();

  const [loading, setLoading] = useState(false);

  const onFinish = async () => {
    const { oldPassword, newPassword } = await form.validateFields();
    setLoading(true);
    api.changePassword({ body: { newPassword, oldPassword } })
      .httpError(412, () => { message.error("原密码不正确"); })
      .then(() => {
        form.setFieldsValue({ oldPassword: "", newPassword: "", confirm: "" });
        message.success("密码更改成功！");
      })
      .finally(() => {
        setLoading(false);
      })
    ;
  };

  return (
    <Spin spinning={loading}>
      <Form initialValues={undefined}
        layout="vertical" form={form} onFinish={onFinish}
      >
        <Form.Item
          rules={[{ required: true }]}
          label="原密码"
          name="oldPassword"
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          rules={[{ required: true }, passwordRule]}
          label="新密码"
          name="newPassword"
        >
          <Input.Password placeholder={passwordRule.message} />
        </Form.Item>
        <Form.Item
          name="confirm"
          label="确认密码"
          hasFeedback
          {...confirmPasswordFormItemProps(form, "newPassword")}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" >
            提交
          </Button>
        </Form.Item>
      </Form>
    </Spin>
  );
};
