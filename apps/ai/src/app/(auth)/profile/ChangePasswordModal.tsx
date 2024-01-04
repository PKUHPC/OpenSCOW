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
import { usePublicConfig } from "src/app/(auth)/context";
import { confirmPasswordFormItemProps } from "src/utils/form";

export interface Props {
  open: boolean;
  onClose: () => void;
}

interface FormInfo {
  oldPassword: string;
  newPassword: string;
}


export const ChangePasswordModal: React.FC<Props> = ({
  open,
  onClose,
}) => {

  const { publicConfig } = usePublicConfig();
  const [form] = Form.useForm<FormInfo>();
  const { message } = App.useApp();

  const [loading, setLoading] = useState(false);

  const onFinish = async () => {
    const { oldPassword, newPassword } = await form.validateFields();
    setLoading(true);
    // api.checkPassword({ query: { password: oldPassword } })
    //   .then((result) => {
    //     if (result.success) {
    //       return api.changePassword({ body: { newPassword } })
    //         .httpError(400, (e) => {
    //           if (e.code === "PASSWORD_NOT_VALID") {
    //             message.error(getRuntimeI18nConfigText(languageId, "passwordPatternMessage"));
    //           };
    //           throw e;
    //         })
    //         .then(() => {
    //           form.resetFields();
    //           message.success(t(p("successMessage")));
    //         });
    //     }
    //     else {
    //       message.error(t(p("errorMessage")));
    //     }
    //   })
    //   .finally(() => {
    //     setLoading(false);
    //   });
  };

  return (
    <Modal
      title="修改密码"
      open={open}
      onOk={form.submit}
      confirmLoading={loading}
      onCancel={onClose}
      destroyOnClose
    >
      <Form
        form={form}
        onFinish={onFinish}
        wrapperCol={{ span: 20 }}
        labelCol={{ span:4, style: { whiteSpace:"normal", textAlign:"left", lineHeight:"16px" } }}

      >
        <Form.Item
          rules={[{ required: true }]}
          label="旧密码"
          name="oldPassword"
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          rules={[{ required: true },
            { pattern: publicConfig.PASSWORD_PATTERN ? new RegExp(publicConfig.PASSWORD_PATTERN) : undefined }]}
          label="新密码"
          name="newPassword"
        >
          <Input.Password placeholder="请输入新密码" />
        </Form.Item>
        <Form.Item
          name="confirm"
          label="确认"
          hasFeedback
          {...confirmPasswordFormItemProps(form, "newPassword", "zh_cn")}
        >
          <Input.Password />
        </Form.Item>
      </Form>
    </Modal>
  );
};


