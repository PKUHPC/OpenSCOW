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
import { useStore } from "simstate";
import { api } from "src/apis";
import { UserStore } from "src/stores/UserStore";
import { emailRule } from "src/utils/form";

export interface Props {
  open: boolean;
  onClose: () => void;
  setEmail: (email: string) => void;
}

interface FormInfo {
  newEmail: string;
  oldEmail: string;
  
}


export const ChangeEmailModal: React.FC<Props> = ({
  open,
  onClose,
  setEmail,
}) => {

  const [form] = Form.useForm<FormInfo>();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);

  const userStore = useStore(UserStore);
  
  const onFinish = async () => {
    const { newEmail } = await form.validateFields();
    setLoading(true);

    await api.changeEmail({ body: { userId:userStore.user?.identityId as string, newEmail } })
      .httpError(500, () => { message.error("修改邮箱失败"); })
      .then(() => {
        form.resetFields();
        form.setFieldValue("oldEmail", newEmail);
        setEmail(newEmail);
        message.success("邮箱更改成功！");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Modal
      title="修改邮箱"
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
          label="原邮箱"
          name="oldEmail"
          initialValue={userStore.user?.email}
        >
          <Input disabled />
        </Form.Item>
        <Form.Item
          rules={[{ required: true }, emailRule]}
          label="新邮箱"
          name="newEmail"
        >
          <Input placeholder="请输入新邮箱" />
        </Form.Item>
      </Form>
    </Modal>
  );
};


