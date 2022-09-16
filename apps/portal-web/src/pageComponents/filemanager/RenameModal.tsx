import { Form, Input, message, Modal } from "antd";
import { dirname, join } from "path";
import { useState } from "react";
import { api } from "src/apis";

interface Props {
  visible: boolean;
  onClose: () => void;
  reload: () => void;
  cluster: string;
  path: string;
}

interface FormProps {
  newFileName: string;
}

export const RenameModal: React.FC<Props> = ({ visible, onClose, path, reload, cluster }) => {
  const [form] = Form.useForm<FormProps>();
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    const { newFileName } = await form.validateFields();
    setLoading(true);
    await api.moveFileItem({ body: { cluster, fromPath: path, toPath: join(dirname(path), newFileName) } })
      .then(() => {
        message.success("修改成功");
        reload();
        onClose();
        form.resetFields();
      })
      .finally(() => setLoading(false));

  };

  return (
    <Modal
      visible={visible}
      title="重命名文件"
      okText={"确认"}
      cancelText="取消"
      onCancel={onClose}
      confirmLoading={loading}
      destroyOnClose
      onOk={form.submit}
    >
      <Form form={form} onFinish={onSubmit}>
        <Form.Item label="要重命名的文件">
          <strong>{path}</strong>
        </Form.Item>
        <Form.Item<FormProps> label="新文件名" name="newFileName" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};
