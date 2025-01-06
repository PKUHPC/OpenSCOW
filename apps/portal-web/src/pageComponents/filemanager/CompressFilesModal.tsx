import { App, Form, Input, Modal } from "antd";
import { join } from "path";
import { useState } from "react";
import { api } from "src/apis";
import { prefix, useI18nTranslateToString } from "src/i18n";
import { FileInfo } from "src/pages/api/file/list";

interface Props {
  open: boolean;
  onClose: () => void;
  reload: () => void;
  cluster: string;
  path: string;
  files: FileInfo[]
}

interface FormProps {
  zipFileName: string;
}

const p = prefix("pageComp.fileManagerComp.mkDirModal.");

export const CompressFilesModal: React.FC<Props> = ({ open, onClose, path, files, cluster }) => {

  const { message, modal } = App.useApp();

  const [form] = Form.useForm<FormProps>();
  const [loading, setLoading] = useState(false);

  const t = useI18nTranslateToString();

  const onSubmit = async () => {
    const { zipFileName } = await form.validateFields();
    setLoading(true);
    api.compressFiles({ body: {
      cluster, paths: files.map((f) => join(path, f.name)), archivePath: join(path, zipFileName) },
    }).httpError(415, ({ error }) => {
      modal.error({
        title: "压缩文件/文件夹失败",
        content: error,
      });
      throw error;
    }).then(() => {
      message.success("压缩文件/文件夹成功");
    }).catch((e) => {
      throw e;
    });

    onClose();
    form.resetFields();
  };

  return (
    <Modal
      open={open}
      title={"文件/文件夹压缩"}
      okText={"确认压缩"}
      cancelText={"取消"}
      onCancel={onClose}
      confirmLoading={loading}
      destroyOnClose
      onOk={form.submit}
    >
      <Form form={form} onFinish={onSubmit}>
        <strong>{""}</strong>
        <Form.Item label={"目标压缩文件名"} name="zipFileName" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};
