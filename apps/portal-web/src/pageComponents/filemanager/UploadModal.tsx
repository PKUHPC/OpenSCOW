/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * SCOW is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import { DeleteOutlined, InboxOutlined } from "@ant-design/icons";
import { App, Button, Modal, Upload } from "antd";
import { join } from "path";
import { api } from "src/apis";
import { urlToUpload } from "src/pageComponents/filemanager/api";
import { publicConfig } from "src/utils/config";

interface Props {
  open: boolean;
  onClose: () => void;
  reload: () => void;
  cluster: string;
  path: string;
}

export const UploadModal: React.FC<Props> = ({ open, onClose, path, reload, cluster }) => {

  const { message, modal } = App.useApp();

  return (
    <Modal
      open={open}
      title="上传文件"
      onCancel={onClose}
      destroyOnClose
      maskClosable={false}
      footer={[
        <Button key="close" onClick={onClose}>
          关闭
        </Button>,
      ]}
    >
      <p>
        文件将会上传到：<strong>{path}</strong>。同名文件将会被覆盖。
      </p>
      <p>
        单个上传文件大小最大为：<strong>{publicConfig.CLIENT_MAX_BODY_SIZE}</strong>。
      </p>
      <Upload.Dragger
        name="file"
        multiple
        action={async (file) => urlToUpload(cluster, join(path, file.name))}
        withCredentials
        showUploadList={{
          removeIcon: (file) => {
            return (
              <DeleteOutlined title={file.status === "uploading" ? "取消上传" : "删除上传记录"} />
            );
          },
        }}
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
            const exists = await api.fileExist({ query:{ cluster: cluster, path: join(path, file.name) } });
            if (exists.result) {
              modal.confirm({
                title: "文件/目录已存在",
                content: `文件/目录${file.name}已存在，是否覆盖？`,
                okText: "确认",
                onOk: async () => {
                  const fileType = await api.getFileType({ query:{ cluster: cluster, path: join(path, file.name) } });
                  const deleteOperation = fileType.type === "dir" ? api.deleteDir : api.deleteFile;
                  await deleteOperation({ query: { cluster: cluster, path: join(path, file.name) } })
                    .then(() => resolve(file));
                },
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
