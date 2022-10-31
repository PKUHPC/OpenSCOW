import { PlusOutlined } from "@ant-design/icons";
import { Button, Form, Input, message, Modal } from "antd";
import React, { useState } from "react";
import { api } from "src/apis";


interface FormProps {
  name: string;
}

interface ModalProps {
  visible: boolean;
  close: () => void;
  refresh: () => void;
}

const NewTenantModal: React.FC<ModalProps> = ({
  visible, close, refresh,
}) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm<FormProps>();

  const onOk = async () => {
    setLoading(true);
    const { name } = await form.validateFields();

    await api.createTenant({ body: { name } })
      .httpError(409, () => {
        message.error("租户名称不能重复！");
      })
      .then(() => {
        message.success("添加成功！");
        refresh();
        close();
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Modal
      title="添加租户"
      open={visible}
      onCancel={close}
      onOk={onOk}
      confirmLoading={loading}
    >
      <Form form={form}>
        <Form.Item name="name" required label="租户名称">
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

interface Props {
  refresh: () => void;
}

export const AddTenantButton: React.FC<Props> = ({ refresh }) => {

  const [modalShow, setModalShow] = useState(false);

  return (
    <>
      <NewTenantModal
        close={() => setModalShow(false)}
        visible={modalShow}
        refresh={refresh}
      />
      <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalShow(true)}>
      添加租户
      </Button>
    </>
  );
};
