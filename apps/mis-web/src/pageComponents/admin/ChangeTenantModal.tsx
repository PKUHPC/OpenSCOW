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

interface Props {
    tenantName: string;
    name: String
    userId: string;
    onClose: () => void;
    onComplete: (newTenantName: string) => Promise<void>;
    open: boolean;
}

interface FormProps {
  newTenantName: string;
}
const p = prefix("component.others.");

const ChangePasswordModal: React.FC<Props> = ({ tenantName, name, userId, onClose, onComplete, open }) => {

  const t = useI18nTranslateToString();

  const [form] = Form.useForm<FormProps>();
  const [loading, setLoading] = useState(false);

  const onOK = async () => {
    const { newTenantName } = await form.validateFields();
    setLoading(true);
    await onComplete(newTenantName)
      .then(() => {
        form.resetFields();
        onClose();
      })
      .finally(() => setLoading(false));
  };

  const languageId = useI18n().currentLanguage.id;

  return (
    <Modal
      // title={`${t(p("modifyUser"))}${name}（ID：${userId}）${t(p("password"))}`}
      title="修改租户"
      open={open}
      onOk={onOK}
      confirmLoading={loading}
      onCancel={onClose}
    >
      <Form
        form={form}
        initialValues={undefined}
        preserve={false}
      >

        <Form.Item label={"用户ID"}>
          <span>{userId}</span>
        </Form.Item>
        <Form.Item label={"姓名"}>
          <span>{name}</span>
        </Form.Item>
        <Form.Item label={"原租户"}>
          <span>{tenantName}</span>
        </Form.Item>
        <Form.Item
          // label={t(p("newPassword"))}
          rules={[{ required: true, message: "请输入新租户" }]}
          label="新租户"
          name="newTenantName"
        >
          <Input />
        </Form.Item>

      </Form>
    </Modal>
  );
};
export const ChangeTenantModalLink = ModalLink(ChangePasswordModal);
