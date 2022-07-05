import { Form, Input, message, Modal } from "antd";
import { join } from "path";
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

export const CreateFileModal: React.FC<Props> = ({ visible, onClose, path, reload, cluster }) => {
  const [form] = Form.useForm<FormProps>();
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    const { newFileName } = await form.validateFields();
    setLoading(true);
    await api.createFile({ body: { cluster, path: join(path, newFileName)  } })
      .httpError(409, () => { message.error("同名文件或者目录已经存在！");})
      .then(() => {
        message.success("创建成功");
        reload();
        onClose();
        form.resetFields();
      })
      .finally(() => setLoading(false));
  };

  return (
    <Modal
      visible={visible}
      title="创建文件"
      okText={"确认"}
      cancelText="取消"
      onCancel={onClose}
      confirmLoading={loading}
      destroyOnClose
      onOk={form.submit}
    >
      <Form form={form} onFinish={onSubmit}>
        <Form.Item label="要创建的文件的目录">
          <strong>{path}</strong>
        </Form.Item>
        <Form.Item<FormProps> label="文件名" name="newFileName" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};
