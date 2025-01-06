import { DownOutlined } from "@ant-design/icons";
import { App, Form, Input, Modal, Tree, TreeDataNode } from "antd";
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

const p = prefix("pageComp.fileManagerComp.mkDirModal.");

export const CompressFilesModal: React.FC<Props> = ({ open, onClose, path, files, cluster }) => {

  const { message, modal } = App.useApp();

  const [loading, setLoading] = useState(false);

  const [form] = Form.useForm<FormProps>();

  const t = useI18nTranslateToString();

  const handleCompress = async (zipFileName: string) => {
    await api.compressFiles({ body: {
      cluster, paths: files.map((f) => join(path, f.name)), archivePath: join(path, zipFileName + fileSuffix) },
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

    message.info("压缩请求已提交...");
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
      title={"文件/文件夹压缩"}
      okText={"确认压缩"}
      cancelText={"取消"}
      onCancel={onClose}
      destroyOnClose
      onOk={form.submit}
      loading={loading}
    >
      <Form form={form} onFinish={onSubmit}>
        <strong>{"待压缩文件列表"}</strong>
        <Tree
          showLine
          style={{ marginTop: "8px" }}
          height={300}
          switcherIcon={<DownOutlined />}
          treeData={generateCompressFilesTree(path, files)}
        />
        <Form.Item
          label={"目标压缩文件名"}
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
