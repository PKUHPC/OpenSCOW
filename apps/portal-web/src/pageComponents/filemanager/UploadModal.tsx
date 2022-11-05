import { InboxOutlined } from "@ant-design/icons";
import { Button, message, Modal, Upload } from "antd";
import axios from "axios";
import { join } from "path";
import { urlToUpload } from "src/pageComponents/filemanager/api";

interface Props {
  visible: boolean;
  onClose: () => void;
  reload: () => void;
  cluster: string;
  path: string;
}

export const UploadModal: React.FC<Props> = ({ visible, onClose, path, reload, cluster }) => {

  const uploadRequest = async (options) => {
    const { onSuccess, onError, file, onProgress, action } = options;

    const fmData = new FormData();
    const config = {
      headers: { "content-type": "multipart/form-data" },
      onUploadProgress: (event) => {
        console.log(event.loaded / event.total);
        onProgress({ percent: (event.loaded / event.total) * 100 });
      },
    };
    fmData.append("file", file);
    try {
      const res = await axios.post(action, fmData, config);
      onSuccess("Ok");
      console.log("server res: ", res);
    } catch (err) {
      console.log("error: ", err);
      // const error = new Error('some error');
      onError({ err });
    }
  };

  return (
    <Modal
      visible={visible}
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
        customRequest={uploadRequest}
        withCredentials
        progress={{
          strokeWidth: 3,
          format: (percent) => percent && `${parseFloat(percent.toFixed(2))}%`,
        }}
        onChange={({ file }) => {
          if (file.status === "done") {
            message.success(`${file.name}上传成功`);
            reload();
          } else if (file.status === "error") {
            message.error(`${file.name}上传失败`);
          }
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
