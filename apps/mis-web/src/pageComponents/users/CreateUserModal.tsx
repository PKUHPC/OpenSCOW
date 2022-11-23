import { Form, Modal } from "antd";
import React, { useState } from "react";
import { api } from "src/apis";
import { useMessage } from "src/layouts/prompts";
import { CreateUserForm, CreateUserFormFields } from "src/pageComponents/users/CreateUserForm";

interface Props {
  open: boolean;
  onClose: () => void;
}

export const CreateUserModal: React.FC<Props> = ({
  onClose, open,
}) => {
  const [form] = Form.useForm<CreateUserFormFields>();
  const [loading, setLoading] = useState(false);

  const message = useMessage();

  const onOk = async () => {
    const { password, email, identityId, name } = await form.validateFields();
    setLoading(true);
    await api.createUser({ body: { email, identityId, name, password } })
      .httpError(409, () => { message.error("此用户ID已经存在！"); })
      .then(() => {
        message.success("用户创建完成");
        onClose();
      })
      .finally(() => setLoading(false));

  };

  return (
    <Modal
      title="创建用户"
      open={open}
      onCancel={onClose}
      confirmLoading={loading}
      onOk={onOk}
    >
      <p>用户不存在，请输入用户信息以创建用户。</p>
      <Form form={form}>
        <CreateUserForm />
      </Form>
    </Modal>

  );
};




