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
import { prefix, useI18n, useI18nTranslateToString } from "src/i18n";
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
const p = prefix("component.others.");

const ChangePasswordModal: React.FC<Props> = ({ name, userId, onClose, onComplete, open }) => {

  const t = useI18nTranslateToString();

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

  const languageId = useI18n().currentLanguage.id;

  return (
    <Modal
      title={`${t(p("modifyUser"))}${name}（ID：${userId}）${t(p("password"))}`}
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
          rules={[{ required: true, message: t(p("inputNewPassword")) }, passwordRule(languageId)]}
          label={t(p("newPassword"))}
          name="newPassword"
        >
          <Input.Password placeholder={passwordRule(languageId).message} />
        </Form.Item>
        <Form.Item
          name="confirm"
          label={t(p("confirmPassword"))}
          hasFeedback
          {...confirmPasswordFormItemProps(form, "newPassword", languageId)}
        >
          <Input.Password />
        </Form.Item>
      </Form>
    </Modal>
  );
};
export const ChangePasswordModalLink = ModalLink(ChangePasswordModal);
