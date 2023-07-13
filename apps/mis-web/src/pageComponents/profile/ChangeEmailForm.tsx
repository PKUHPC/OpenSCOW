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

import { App, Button, Form, Input, Spin } from "antd";
import React, { useState } from "react";
import { useStore } from "simstate";
import { api } from "src/apis";
import { UserStore } from "src/stores/UserStore";
import { emailRule } from "src/utils/form";


interface FormProps {
  newEmail: string;
  confirm: string;
}

export const ChangeEmailForm: React.FC = () => {
  const { message } = App.useApp();


  const [form] = Form.useForm<FormProps>();

  const [loading, setLoading] = useState(false);

  // 拿到用户信息以获取用户原邮箱
  const userStore = useStore(UserStore);


  const onFinish = async () => {
    const { newEmail } = await form.validateFields();
    setLoading(true);

    // LDap改邮箱的结果
    const LDapRes = await api.changeEmail({ body: { newEmail } });

    // database改邮箱的结果
    const DBRes = await api.changeDBEmail({ body: { userId:userStore.user?.identityId as string, newEmail } });

    Promise.allSettled([LDapRes, DBRes]).then(() => {
      form.resetFields();
      form.setFieldValue("oldEmail", newEmail);
      message.success("邮箱更改成功！");
    })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Spin spinning={loading}>
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
          <Input placeholder={emailRule.message} />
        </Form.Item>
        <Form.Item
          rules={[{ required: true }]}
          label="验证码"
          name="validateCode"
        >
          <Input placeholder={"请输入验证码"} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            提交
          </Button>
        </Form.Item>
      </Form>
    </Spin>
  );
};
