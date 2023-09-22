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

import { App, Form, Input, Modal } from "antd";
import React, { useState } from "react";
import { api } from "src/apis";
import { confirmPasswordFormItemProps, passwordRule } from "src/utils/form";

export interface Props {
  open: boolean;
  onClose: () => void;
}

interface FormInfo {
  oldPassword: string;
  newPassword: string;
}


export const ChangePasswordModal: React.FC<Props> = ({
  open,
  onClose,
}) => {

  const [form] = Form.useForm<FormInfo>();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  
  const onFinish = async () => {
    const { oldPassword, newPassword } = await form.validateFields();
    setLoading(true);
    api.checkPassword({ query: { password: oldPassword } })
      .then((result) => {
        if (result.success) {
          return api.changePassword({ body: { newPassword } })
            .then(() => {
              form.resetFields();
              message.success("密码更改成功！");
            });
        }
        else {
          message.error("原密码错误！");
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Modal
      title="修改密码"
      open={open}
      onOk={form.submit}
      confirmLoading={loading}
      onCancel={onClose}
      destroyOnClose
    >
      <Form
        form={form}
        onFinish={onFinish}
        wrapperCol={{ span: 20 }}
        labelCol={{ span: 4 }}
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
      </Form>
    </Modal>
  );
};


