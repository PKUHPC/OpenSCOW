/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * OpenSCOW is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import { getEmailRule } from "@scow/lib-web/build/utils/form";
import { App, Form, Input, Modal } from "antd";
import React, { useState } from "react";
import { useStore } from "simstate";
import { api } from "src/apis";
import { prefix, useI18n, useI18nTranslateToString } from "src/i18n";
import { UserStore } from "src/stores/UserStore";


export interface Props {
  open: boolean;
  onClose: () => void;
  setEmail: (email: string) => void;
}

interface FormInfo {
  newEmail: string;
  oldEmail: string;

}

const p = prefix("pageComp.profile.");

export const ChangeEmailModal: React.FC<Props> = ({
  open,
  onClose,
  setEmail,
}) => {

  const t = useI18nTranslateToString();
  const languageId = useI18n().currentLanguage.id;

  const [form] = Form.useForm<FormInfo>();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);

  const userStore = useStore(UserStore);

  const onFinish = async () => {
    const { newEmail } = await form.validateFields();
    setLoading(true);

    await api.changeEmail({ body: { userId: userStore.user!.identityId, newEmail } })
      .httpError(404, () => { message.error(t(p("userNotExist"))); })
      .httpError(500, () => { message.error(t(p("changeEmailFail"))); })
      .httpError(501, () => { message.error(t(p("unavailable"))); })
      .then(() => {
        form.resetFields();
        form.setFieldValue("oldEmail", newEmail);
        setEmail(newEmail);
        message.success(t(p("changeEmailSuccess")));
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Modal
      title={t(p("changeEmail"))}
      open={open}
      onOk={form.submit}
      confirmLoading={loading}
      onCancel={onClose}
      destroyOnClose
    >
      <Form
        initialValues={undefined}
        layout="vertical"
        form={form}
        onFinish={onFinish}
      >
        <Form.Item
          label={t(p("oldEmail"))}
          name="oldEmail"
          initialValue={userStore.user?.email}
        >
          <Input disabled />
        </Form.Item>
        <Form.Item
          rules={[{ required: true }, getEmailRule(languageId)]}
          label={t(p("newEmail"))}
          name="newEmail"
        >
          <Input placeholder={t(p("inputEmail"))} />
        </Form.Item>
      </Form>
    </Modal>
  );
};


