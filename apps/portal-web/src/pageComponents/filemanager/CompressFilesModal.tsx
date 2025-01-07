import { DownOutlined } from "@ant-design/icons";
import { App, Form, Input, Modal, Tree, TreeDataNode } from "antd";
import { join } from "path";
import { useState } from "react";
import { api } from "src/apis";
import { prefix, useI18nTranslateToString } from "src/i18n";
import { Compression } from "src/pageComponents/filemanager/FileManager";
import { FileInfo } from "src/pages/api/file/list";

interface Props {
  open: boolean;
  cluster: string;
  path: string;
  files: FileInfo[];
  onClose: () => void;
  setCompression: React.Dispatch<React.SetStateAction<Compression>>;
}

interface FormProps {
  zipFileName: string;
}

const fileSuffix = ".zip";

const generateCompressFilesTree = (path: string, files: FileInfo[]): TreeDataNode[] => {
  return [{
    title: `${path}`,
    key: "root",
    children: files.map((f) => ({
      title: f.name,
      key: f.name,
    })),
  }];
};

const fileManagerP = prefix("pageComp.fileManagerComp.fileManager.");

const p = prefix("pageComp.fileManagerComp.compressFilesModal.");

export const CompressFilesModal: React.FC<Props> = ({
  open, onClose, setCompression, path, files, cluster }) => {

  const { message, modal } = App.useApp();

  const [loading, setLoading] = useState(false);

  const [form] = Form.useForm<FormProps>();

  const t = useI18nTranslateToString();

  const handleCompress = async (zipFileName: string) => {
    setCompression((compression) => ({
      ...compression, started: compression.started.concat(zipFileName + fileSuffix),
    }));

    await api.compressFiles({ body: {
      cluster, paths: files.map((f) => join(path, f.name)), archivePath: join(path, zipFileName + fileSuffix) },
    }).httpError(415, ({ error }) => {
      modal.error({
        title: t(p("compressFailed")),
        content: error,
      });
      throw error;
    }).then(() => {
      message.success(t(p("compressSuccess")));
      setCompression((compression) => ({ ...compression, completed: compression.completed.concat(zipFileName) }));
    }).catch((e) => {
      throw e;
    });

    message.info(t(p("compressRequestSubmit")));
  };

  const onSubmit = async () => {
    const { zipFileName } = await form.validateFields();
    setLoading(true);
    const exists = await api.fileExist({ query: { cluster: cluster, path: join(path, zipFileName + fileSuffix) } });

    if (exists.result) {
      await new Promise<void>((res) => {
        modal.confirm({
          title: t(fileManagerP("moveCopy.existModalTitle")),
          content: t(fileManagerP("moveCopy.existModalContent"), [zipFileName]),
          okText: t(fileManagerP("moveCopy.existModalOk")),
          onOk: async () => {
            handleCompress(zipFileName);
            onClose();
            form.resetFields();
          },
          onCancel: async () => { res(); },
        });
      });
    } else {
      handleCompress(zipFileName);
      onClose();
      form.resetFields();
    }
    setLoading(false);
  };

  return (
    <Modal
      open={open}
      title={t(p("compression"))}
      okText={t(p("compressConfirm"))}
      cancelText={t(p("cancel"))}
      onCancel={onClose}
      destroyOnClose
      onOk={form.submit}
      loading={loading}
    >
      <Form form={form} onFinish={onSubmit}>
        <strong>{t(p("compressFileList"))}</strong>
        <Tree
          showLine
          style={{ marginTop: "8px" }}
          height={300}
          switcherIcon={<DownOutlined />}
          treeData={generateCompressFilesTree(path, files)}
        />
        <Form.Item
          label={t(p("compressFileName"))}
          name="zipFileName"
          rules={[{ required: true }]}
          initialValue={files[0]?.name || ""}
        >
          <Input addonAfter=".zip" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
