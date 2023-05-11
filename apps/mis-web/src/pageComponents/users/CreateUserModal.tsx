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
import React, { useEffect, useState } from "react";
import { api } from "src/apis";
import { CreateUserFormFields } from "src/pageComponents/users/CreateUserForm";
import { userIdRule } from "src/utils/createUser";
import { confirmPasswordFormItemProps, emailRule, passwordRule } from "src/utils/form";

export interface NewUserInfo {
  identityId: string;
  name: string;
}

interface Props {
  newUserInfo: NewUserInfo | undefined;
  accountName: string;
  open: boolean;
  onCreated: (newUserInfo: NewUserInfo) => Promise<void>;
  onClose: () => void;
}

export const CreateUserModal: React.FC<Props> = ({
  onCreated, onClose, open, newUserInfo, accountName,
}) => {
  const [form] = Form.useForm<CreateUserFormFields>();
  const [loading, setLoading] = useState(false);

  const { message } = App.useApp();

  const onOk = async () => {
    const { password, email, identityId, name } = await form.validateFields();
    setLoading(true);
    await api.createUser({ body: { email, identityId, name, password } })
      .httpError(409, () => { message.error("此用户ID已经存在！"); })
      .then(() => {
        return onCreated({ identityId, name });
      })
      .finally(() => setLoading(false));

  };

  useEffect(() => {
    if (newUserInfo) {
      form.setFieldsValue(newUserInfo);
    }
  }, [newUserInfo]);

  return (
    <Modal
      title="创建用户"
      open={open}
      onCancel={onClose}
      confirmLoading={loading}
      onOk={onOk}
    >
      <p>用户不存在，请输入新用户信息以创建用户并添加进账户{accountName}。</p>
      <Form form={form} initialValues={newUserInfo}>
        <Form.Item
          label="用户ID"
          name="identityId"
          rules={[
            { required: true },
            ...userIdRule ? [userIdRule] : [],
          ]}
        >
          <Input disabled />
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
          rules={[{ required: true }, passwordRule]}
        >
          <Input.Password placeholder={passwordRule.message} />
        </Form.Item>
        <Form.Item
          label="确认密码"
          name="confirmPassword"
          hasFeedback
          {...confirmPasswordFormItemProps(form, "password")}
        >
          <Input.Password placeholder={passwordRule.message} />
        </Form.Item>
      </Form>
    </Modal>

  );
};




