import { Form, message, Modal } from "antd";
import React, { useState } from "react";
import { api } from "src/apis";
import { CreateTenantForm, CreateTenantFormFields } from "src/pageComponents/tenant/CreateTenantForm";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const CreateTenantModal: React.FC<Props> = ({
  onClose, visible,
}) => {
  const [form] = Form.useForm<CreateTenantFormFields>();
  const [loading, setLoading] = useState(false);

  const onOk = async () => {
    const { name } = await form.validateFields();
    setLoading(true);
    await api.createTenant({ body: { name } })
      .httpError(409, () => { message.error("此租户ID已经存在！"); })
      .then(() => {
        message.success("租户创建完成");
        onClose();
      })
      .finally(() => setLoading(false));

  };

  return (
    <Modal
      title="创建租户"
      open={visible}
      onCancel={onClose}
      confirmLoading={loading}
      onOk={onOk}
    >
      <p>租户不存在，请输入租户名称以创建租户。</p>
      <Form>
        <CreateTenantForm />
      </Form>
    </Modal>

  );
};




