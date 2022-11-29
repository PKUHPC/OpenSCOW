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

import { Alert, Button, Form, Typography } from "antd";
import { useState } from "react";
import { api } from "src/apis";
import { Centered } from "src/components/layouts";
import { FormLayout } from "src/layouts/FormLayout";
import { useMessage } from "src/layouts/prompts";
import { CreateUserForm, CreateUserFormFields } from "src/pageComponents/users/CreateUserForm";
import styled from "styled-components";

type FormFields = Omit<CreateUserFormFields, "password" | "confirmPassword">;

const AlertContainer = styled.div`
  margin-bottom: 16px;
`;

export const InitAdminForm: React.FC = () => {
  const [form] = Form.useForm<FormFields>();

  const message = useMessage();

  const [loading, setLoading] = useState(false);
  const onFinish = async () => {
    const { email, identityId, name } = await form.validateFields();
    setLoading(true);

    api.createInitAdmin({ body: { email, identityId, name } })
      .then(() => {
        message.success("添加完成！");
        form.resetFields();
      }).finally(() => {
        setLoading(false);
      });
  };

  return (
    <Centered>
      <FormLayout maxWidth={800}>
        <Typography.Paragraph>您可以在此创建初始管理员用户。</Typography.Paragraph>
        <Typography.Paragraph>
          这里添加的用户为初始管理员，位于默认租户中，将会自动拥有<strong>平台管理员</strong>和<strong>默认租户的租户管理员</strong>角色。
        </Typography.Paragraph>
        <AlertContainer>
          <Alert
            type="warning"
            showIcon
            message="请确认初始管理员用户必须已经存在于认证系统，且用户的ID必须和认证系统中的用户ID保持一致。"
          />
        </AlertContainer>
        <Form form={form} onFinish={onFinish}>
          <CreateUserForm noPassword />
          <Centered>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
              添加
              </Button>
            </Form.Item>
          </Centered>
        </Form>
      </FormLayout>
    </Centered>
  );

};
