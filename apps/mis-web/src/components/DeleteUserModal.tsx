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

import { Form, Input, message, Modal } from "antd";
import { useState } from "react";
import { ModalLink } from "src/components/ModalLink";
import { prefix, useI18nTranslateToString } from "src/i18n";

interface Props {
  name: string;
  userId: string;
  onClose: () => void;
  onComplete: (userId: string, userName: string, comments: string) => Promise<void>;
  open: boolean;
}

interface FormProps {
  userId: string;
  userName: string;
  comments: string;
}

const p = prefix("component.others.");

const DeleteUserModal: React.FC<Props> = ({ name, userId, onClose, onComplete, open }) => {
  const t = useI18nTranslateToString();

  const [form] = Form.useForm<FormProps>();
  const [loading, setLoading] = useState(false);

  const onOK = async () => {
    try {
      const { userId: inputUserId, userName: inputUserName, comments = "" } = await form.validateFields();
      const trimmedUserId = inputUserId.trim();
      const trimmedUserName = inputUserName.trim();
      const trimmedComments = comments.trim();

      if (trimmedUserId !== userId || trimmedUserName !== name) {
        message.error(t(p("incorrectUserIdOrName")));
        return;
      }
      setLoading(true);
      await onComplete(trimmedUserId, trimmedUserName, trimmedComments)
        .then(() => {
          form.resetFields();
          onClose();
        })
        .finally(() => setLoading(false));
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Modal
      title={`${t(p("deleteUser"))}`}
      open={open}
      onOk={onOK}
      confirmLoading={loading}
      onCancel={onClose}
      width={"620px"} // 设置Modal宽度
    >
      <br />
      <div dangerouslySetInnerHTML={{ __html: t(p("confirmPermanentDeleteUser"), [userId, name]) }} /><br />
      <div dangerouslySetInnerHTML={{ __html: t(p("confirmDeleteUserPrompt1")) }} /><br />
      <p><b dangerouslySetInnerHTML={{ __html: t(p("confirmDeleteUserPrompt2")) }} /></p><br />
      <Form
        form={form}
        initialValues={undefined}
        preserve={false}
        layout="horizontal"
        style={{ maxWidth: "100%" }}
      >
        <Form.Item
          label={t(p("userId"))}
          name="userId"
          rules={[{ required: true, message: t(p("userIdRequired")) }]}
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 20 }}
          style={{ marginBottom: 16 }}
          labelAlign="left"
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={t(p("userName"))}
          name="userName"
          rules={[{ required: true, message: t(p("userNameRequired")) }]}
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 20 }}
          style={{ marginBottom: 16 }}
          labelAlign="left"
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={t(p("comments"))}
          name="comments"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 20 }}
          style={{ marginBottom: 16 }}
          labelAlign="left"
        >
          <Input.TextArea rows={3} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export const DeleteUserModalLink = ModalLink(DeleteUserModal);
