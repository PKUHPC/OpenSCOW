import { InboxOutlined } from "@ant-design/icons";
import { Button, Modal, Upload } from "antd";
import { join } from "path";
import { api } from "src/apis";
import { useMessage, useModal } from "src/layouts/prompts";
import { urlToUpload } from "src/pageComponents/filemanager/api";

interface Props {
  open: boolean;
  onClose: () => void;
  reload: () => void;
  cluster: string;
  path: string;
}

export const UploadModal: React.FC<Props> = ({ open, onClose, path, reload, cluster }) => {

  const modal = useModal();
  const message = useMessage();
  
  return (
    <Modal
      open={open}
      title="上传文件"
      onCancel={onClose}
      destroyOnClose
      footer={[
        <Button key="close" onClick={onClose}>
          关闭
        </Button>,
      ]}
    >
      <p>
        文件将会上传到：<strong>{path}</strong>。同名文件将会被覆盖。
      </p>
      <Upload.Dragger
        name="file"
        multiple
        action={async (file) => urlToUpload(cluster, join(path, file.name))}
        withCredentials
        onChange={({ file }) => {
          if (file.status === "done") {
            message.success(`${file.name}上传成功`);
            reload();
          } else if (file.status === "error") {
            message.error(`${file.name}上传失败`);
          }
        }}
        beforeUpload={(file) => {
          return new Promise(async (resolve, reject) => {
            const isExist = await api.fileExist({ query:{ cluster: cluster, path: join(path, file.name) } });
            if (isExist.result) {
              modal.confirm({
                title: "文件已存在",
                content: `文件${file.name}已存在，是否覆盖？`,
                onOk: () => { resolve(file); },
                onCancel: () => { reject(file); },
              });
            } else {
              resolve(file);
            }
          });
        }}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">点击或者将文件拖动到这里</p>
        <p className="ant-upload-hint">
          支持上传单个或者多个文件
        </p>
      </Upload.Dragger>
    </Modal>
  );
};
