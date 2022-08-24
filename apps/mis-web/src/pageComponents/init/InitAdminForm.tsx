import { Alert, Button, Form, message } from "antd";
import { useState } from "react";
import { api } from "src/apis";
import { Centered } from "src/components/layouts";
import { FormLayout } from "src/layouts/FormLayout";
import { CreateUserForm, CreateUserFormFields } from "src/pageComponents/users/CreateUserForm";
import styled from "styled-components";

type FormFields = Omit<CreateUserFormFields, "password" | "confirmPassword">;

const AlertContainer = styled.div`
  margin-bottom: 16px;
`;

export const InitAdminForm: React.FC = () => {
  const [form] = Form.useForm<FormFields>();

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
        <p>您可以在此创建初始管理员用户。这里添加的用户将会自动拥有<strong>平台管理员</strong>和<strong>默认租户的租户管理员权限。</strong></p>
        <AlertContainer>
          <Alert type="warning" showIcon
            message="请确认平台管理员用户必须已经存在于认证系统，且用户的ID必须和认证系统中的用户ID保持一致。"
          />
        </AlertContainer>
        <Form form={form} onFinish={onFinish}>
          <CreateUserForm noPassword />
          <Centered>
            <Form.Item >
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
