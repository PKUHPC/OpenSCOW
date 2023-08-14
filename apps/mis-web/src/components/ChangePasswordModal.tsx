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

import { Form, Input, Modal } from "antd";
import { useState } from "react";
import { ModalLink } from "src/components/ModalLink";
import { confirmPasswordFormItemProps, passwordRule } from "src/utils/form";

interface Props {
    name: string;
    userId: string;
    onClose: () => void;
    onComplete: (newPassword: string) => Promise<void>;
    open: boolean;
}

interface FormProps {
    newPassword: string;
    confirm: string;
}

const ChangePasswordModal: React.FC<Props> = ({ name, userId, onClose, onComplete, open }) => {
  const [form] = Form.useForm<FormProps>();
  const [loading, setLoading] = useState(false);

  const onOK = async () => {
    const { newPassword } = await form.validateFields();
    setLoading(true);
    await onComplete(newPassword)
      .then(() => {
        form.resetFields();
        onClose();
      })
      .finally(() => setLoading(false));
  };

  return (
    <Modal
      title={`修改用户${name}（ID：${userId}）的密码`}
      open={open}
      onOk={onOK}
      confirmLoading={loading}
      onCancel={onClose}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={undefined}
        preserve={false}
      >
        <Form.Item
          rules={[{ required: true, message: "请输入新密码" }, passwordRule]}
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
export const ChangePasswordModalLink = ModalLink(ChangePasswordModal);
