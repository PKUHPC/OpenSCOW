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

import { Alert, App, Form, Input, Modal } from "antd";
import { useState } from "react";
import { api } from "src/apis";
import { ModalLink } from "src/components/ModalLink";
import { prefix, useI18nTranslateToString } from "src/i18n";

interface Props {
  tenantName: string;
  name: string
  userId: string;
  open: boolean;
  onClose: () => void;
  reload: () => void;
}

interface FormProps {
  newTenantName: string;
}
const p = prefix("pageComp.admin.changeTenantModal.");
const pCommon = prefix("common.");

const ChangePasswordModal: React.FC<Props> = ({ tenantName, name, userId, onClose, reload, open }) => {

  const t = useI18nTranslateToString();
  const { message } = App.useApp();

  const [form] = Form.useForm<FormProps>();
  const [loading, setLoading] = useState(false);

  const onOK = async () => {
    const { newTenantName } = await form.validateFields();
    setLoading(true);
    await api.changeTenant({ body:{
      identityId: userId,
      previousTenantName: tenantName,
      tenantName: newTenantName,
    } })
      .httpError(404, (e) => {
        switch (e.code) {
          case "USER_NOT_FOUND":
            message.error(t(p("userNotFound")));
            break;
          case "TENANT_NOT_FOUND":
            message.error(t(p("tenantNotFound")));
            break;
          case "USER_STILL_MAINTAINS_ACCOUNT_RELATIONSHIP":
            message.error(t(p("userStillMaintainsAccountRelationship")));
            break;
          case "USER_ALREADY_EXIST_IN_THIS_TENANT":
            message.error(t(p("userAlreadyExistInThisTenant")));
            break;
          default:
            message.error(t(pCommon("changeFail")));
        } })
      .then(() => {
        message.success(t(pCommon("changeSuccess")));
        form.resetFields();
        reload();
        onClose();
      })
      .finally(() => setLoading(false));
  };

  return (
    <Modal
      title={t(p("modifyTenant"))}
      open={open}
      onOk={onOK}
      confirmLoading={loading}
      onCancel={onClose}
    >
      <Alert banner message={t(p("createTenantWarningInfo"))} type="warning" showIcon />
      <Form
        form={form}
        initialValues={undefined}
        preserve={false}
      >
        <Form.Item label={t(p("userId"))}>
          <span>{userId}</span>
        </Form.Item>
        <Form.Item label={t(p("userName"))}>
          <span>{name}</span>
        </Form.Item>
        <Form.Item label={t(p("originalTenant"))}>
          <span>{tenantName}</span>
        </Form.Item>
        <Form.Item
          rules={[{ required: true, message: t(p("newTenantNameRequired")) }]}
          label={t(p("newTenant"))}
          name="newTenantName"
        >
          <Input />
        </Form.Item>

      </Form>
    </Modal>
  );
};
export const ChangeTenantModalLink = ModalLink(ChangePasswordModal);
