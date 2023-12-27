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

"use client";

import { DeleteOutlined, InboxOutlined } from "@ant-design/icons";
import { App, Button, Modal, Upload, UploadFile } from "antd";
import { join } from "path";
import { useState } from "react";
import { trpc } from "src/utils/trpc.js";

import { urlToUpload } from "../app/(auth)/files/api";

interface Props {
  open: boolean;
  onClose: () => void;
  reload: () => void;
  clusterId: string;
  path: string;
}

// 请求文件大小限制
const CLIENT_MAX_BODY_SIZE = "1G";

enum FileType {
  FILE = "file",
  DIR = "dir"
}

export const UploadModal: React.FC<Props> = ({ open, onClose, path, reload, clusterId }) => {

  const { message, modal } = App.useApp();

  const [ checkExistFilePath, setCheckExistFilePath ] = useState<string>("");
  const [ getTypeFilePath, setGetTypeFilePath ] = useState<string>("");
  const [ uploadFileList, setUploadFileList ] = useState<UploadFile[]>([]);

  const onModalClose = () => {
    setUploadFileList([]);
    onClose();
  };

  const deleteFileMutation = trpc.file.deleteItem.useMutation();

  const { refetch: checkFileExist } = trpc.file.checkFileExist.useQuery({
    clusterId: clusterId, path: checkExistFilePath },
  { enabled: false });

  const { refetch: getFileType } = trpc.file.getFileType.useQuery({
    clusterId: clusterId, path: getTypeFilePath },
  { enabled: false });

  return (
    <Modal
      open={open}
      title="上传文件"
      onCancel={onModalClose}
      destroyOnClose={true}
      maskClosable={false}
      footer={[
        <Button key="close" onClick={onModalClose}>
          关闭
        </Button>,
      ]}
    >
      <p>
        文件将会上传到：<strong>{path}</strong>。同名文件将会被覆盖。
      </p>
      <p>
        单个上传文件大小最大为：<strong>{CLIENT_MAX_BODY_SIZE}</strong>。
      </p>
      <Upload.Dragger
        name="file"
        multiple
        action={async (file) => urlToUpload(clusterId, join(path, file.name))}
        withCredentials
        showUploadList={{
          removeIcon: (file) => {
            return (
              <DeleteOutlined title={file.status === "uploading" ? "取消上传" : "删除上传记录"} />
            );
          },
        }}
        onChange={({ file, fileList }) => {
          console.log(fileList);
          const updatedFileList = [...fileList.filter((f) => f.status)];
          setUploadFileList(updatedFileList);

          if (file.status === "done") {
            message.success(`${file.name}上传成功`);
            reload();
          } else if (file.status === "error") {
            message.error(`${file.name}上传失败`);
          }
        }}
        beforeUpload={(file) => {
          const fileMaxSize = parseInt(CLIENT_MAX_BODY_SIZE.slice(0, -1)) * (1024 ** 3);

          if (file.size > fileMaxSize) {
            message.error(`${file.name}上传失败,文件大小超过${CLIENT_MAX_BODY_SIZE}`);
            return Upload.LIST_IGNORE;
          }

          return new Promise(async (resolve, reject) => {
            setCheckExistFilePath(join(path, file.name));
            const exists = await checkFileExist();

            if (exists.data?.exists) {
              modal.confirm({
                title: "文件已存在",
                content: `文件: ${file.name}已存在，是否覆盖？`,
                okText: "确认",
                onOk: async () => {
                  setGetTypeFilePath(join(path, file.name));
                  const fileType = await getFileType();

                  if (fileType.data?.type) {
                    await deleteFileMutation.mutateAsync({
                      target: fileType.data.type === FileType.DIR ? "DIR" : "FILE",
                      clusterId: clusterId,
                      path: join(path, file.name),
                    }).then(() => resolve(file));
                  }

                },
                onCancel: () => { reject(file); },
              });
            } else {
              resolve(file);
            }

          });
        }}
        fileList={uploadFileList}
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
