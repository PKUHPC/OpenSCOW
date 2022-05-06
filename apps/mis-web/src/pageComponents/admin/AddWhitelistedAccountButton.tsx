import { PlusOutlined } from "@ant-design/icons";
import { Button, Form, Input,message, Modal } from "antd";
import React, { useState } from "react";
import { api } from "src/apis";

interface FormProps {
  accountName: string;
  comment: string;
}

interface ModalProps {
  visible: boolean;
  close: () => void;
  refresh: () => void;
}

const NewAccountModal: React.FC<ModalProps> = ({
  visible, close, refresh,
}) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm<FormProps>();

  const onOk = async () => {
    const { accountName, comment } = await form.validateFields();
    setLoading(true);

    await api.whitelistAccount({ body: { accountName, comment } })
      .httpError(404, () => {
        message.error("账户不存在！");
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
      title="添加白名单账户"
      visible={visible}
      onCancel={close}
      onOk={onOk}
      confirmLoading={loading}
    >
      <Form form={form}>
        <Form.Item name="accountName" rules={[{ required: true }]} label="账户名">
          <Input />
        </Form.Item>
        <Form.Item name="comment" rules={[{ required: true }]} label="备注">
          <Input.TextArea />
        </Form.Item>
      </Form>
    </Modal>
  );
};

interface Props {
  refresh: () => void;
}

export const AddWhitelistedAccountButton: React.FC<Props> = ({ refresh }) => {

  const [modalShow, setModalShow] = useState(false);

  return (
    <>
      <NewAccountModal close={() => setModalShow(false)} visible={modalShow} refresh={refresh} />
      <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalShow(true)}>
      添加白名单账户
      </Button>
    </>
  );
};
