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

import { App, Form, Input, Modal } from "antd";
import React, { useEffect, useState } from "react";
import { api } from "src/apis";
import { prefix, useI18n, useI18nTranslateToString } from "src/i18n";
import { CreateUserFormFields } from "src/pageComponents/users/CreateUserForm";
import { getRuntimeI18nConfigText } from "src/utils/config";
import { getUserIdRule } from "src/utils/createUser";
import { confirmPasswordFormItemProps, getEmailRule, passwordRule } from "src/utils/form";

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
const p = prefix("pageComp.user.createUserModal.");
const pCommon = prefix("common.");

export const CreateUserModal: React.FC<Props> = ({
  onCreated, onClose, open, newUserInfo, accountName,
}) => {

  const t = useI18nTranslateToString();

  const [form] = Form.useForm<CreateUserFormFields>();
  const [loading, setLoading] = useState(false);

  const { message } = App.useApp();

  const onOk = async () => {
    const { password, email, identityId, name } = await form.validateFields();
    setLoading(true);
    await api.createUser({ body: { email, identityId, name: name.trim(), password } })
      .httpError(409, () => { message.error(t(p("alreadyExist"))); })
      .httpError(400, (e) => {
        if (e.code === "USERID_NOT_VALID") {
          message.error(userIdRule?.message);
        };
        if (e.code === "PASSWORD_NOT_VALID") {
          message.error(getRuntimeI18nConfigText(languageId, "passwordPatternMessage"));
        };
        throw e;
      })
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

  const languageId = useI18n().currentLanguage.id;
  const userIdRule = getUserIdRule(languageId);

  return (
    <Modal
      title={t(p("createUser"))}
      open={open}
      onCancel={onClose}
      confirmLoading={loading}
      onOk={onOk}
    >
      <p>{t(p("notExist"))} {accountName}。</p>
      <Form form={form} initialValues={newUserInfo}>
        <Form.Item
          label={t(pCommon("userId"))}
          name="identityId"
          rules={[
            { required: true },
            ...userIdRule ? [userIdRule] : [],
          ]}
        >
          <Input disabled placeholder={userIdRule?.message} />
        </Form.Item>
        <Form.Item label={t(pCommon("userFullName"))} name="name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item
          label={t(p("email"))}
          name="email"
          rules={[{ required: true }, getEmailRule(languageId)]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={t(p("password"))}
          name="password"
          rules={[{ required: true }, passwordRule(languageId)]}
        >
          <Input.Password placeholder={passwordRule(languageId).message} />
        </Form.Item>
        <Form.Item
          label={t(p("confirm"))}
          name="confirmPassword"
          hasFeedback
          {...confirmPasswordFormItemProps(form, "password", languageId)}
        >
          <Input.Password placeholder={passwordRule(languageId).message} />
        </Form.Item>
      </Form>
    </Modal>

  );
};




