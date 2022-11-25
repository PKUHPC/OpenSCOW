import { Alert, Button, Form, Typography } from "antd";
import { useState } from "react";
import { api } from "src/apis";
import { Centered } from "src/components/layouts";
import { FormLayout } from "src/layouts/FormLayout";
import { useMessage, useModal } from "src/layouts/prompts";
import { CreateUserForm, CreateUserFormFields } from "src/pageComponents/users/CreateUserForm";
import { publicConfig } from "src/utils/config";
import styled from "styled-components";


type FormFields = Omit<CreateUserFormFields, "confirmPassword">;

const AlertContainer = styled.div`
  margin-bottom: 16px;
`;

export const InitAdminForm: React.FC = () => {
  const [form] = Form.useForm<FormFields>();

  const message = useMessage();
  const Modal = useModal();

  const [loading, setLoading] = useState(false);
  const onFinish = async () => {
    setLoading(true);
    const { email, identityId, name, password } = await form.validateFields();
    publicConfig.ENABLE_CREATE_USER ?
      // 当前认证系统支持创建用户
      await api.userExists({ body: { email, identityId, name, password } }).then((isExist) => {
        isExist.existsInScow ?
          (
            Modal.error({
              title: "",
              content: "用户已存在于SCOW数据库",
              onOk: async () => {
                setLoading(false);
              },
            })) :
          
          Modal.confirm({
            title: "请确认",
            content: isExist.existsInAuth ? "此用户存在于已经认证系统，确认添加为初始管理员？" : "用户不存在，是否确认创建此用户并添加为初始管理员？",
            onCancel: () => {
              setLoading(false);
            },
            onOk: async () => {
              await api.createInitAdmin(
                { body: { email, identityId, name, password, existsInAuth: isExist.existsInAuth } })
                .then(() => {
                  message.success("添加完成！");
                  form.resetFields();
                }).finally(() => {
                  setLoading(false);
                });
            },
          });
      })
      // 当前认证系统不支持创建用户
      : await api.userExists({ body: { email, identityId, name, password } })
        .then((isExist) => {
          isExist.existsInScow ?
            Modal.error({
              title: "",
              content: "用户已存在于SCOW数据库",
              onOk: async () => {
                setLoading(false);
              },
            }) :
          // if (!isExist) {
            Modal.confirm({
              title: "请确认",
              // icon: <ExclamationCircleOutlined />,
              // 用户不存在，调用
              content: isExist.existsInAuth ? "用户存在，确定要将此用户设置为初始管理员？" : "用户不存在，确认表示新建此用户？",
              onOk: async () => {
                await api.createInitAdmin(
                  { body: { email, identityId, name, password, existsInAuth: isExist.existsInAuth } })
                  .then(() => {
                    message.success("添加完成！");
                    form.resetFields();
                  }).finally(() => {
                    setLoading(false);
                  });
              },
              onCancel: async () => {
                setLoading(false);
              },
            });
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
            message={publicConfig.ENABLE_CREATE_USER ? "当前认证系统支持创建用户，您可以选择加入一个已存在的用户，或者创建一个全新的用户。系统将会在认证系统中创建此用户"
              : "当前认证系统不支持创建用户，请确认要添加的用户必须已经存在于认证系统，且用户的ID必须和认证系统中的用户ID保持一致"}
            // message="请确认初始管理员用户必须已经存在于认证系统，且用户的ID必须和认证系统中的用户ID保持一致。"
          />
        </AlertContainer>
        <Form form={form} onFinish={onFinish}>
          <CreateUserForm />
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
