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
import { App, Button, Modal, Upload, UploadFile } from "antd";
import { join } from "path";
import { useState } from "react";
import { api } from "src/apis";
import { prefix, useI18nTranslate, useI18nTranslateToString } from "src/i18n";
import { urlToUpload } from "src/pageComponents/filemanager/api";
import { publicConfig } from "src/utils/config";

interface Props {
  open: boolean;
  onClose: () => void;
  reload: () => void;
  cluster: string;
  path: string;
}

const p = prefix("pageComp.fileManagerComp.uploadModal.");

export const UploadModal: React.FC<Props> = ({ open, onClose, path, reload, cluster }) => {

  const { message, modal } = App.useApp();
  const [ uploadFileList, setUploadFileList ] = useState<UploadFile[]>([]);

  const { t } = useI18nTranslateToString();
  const { tArgs } = useI18nTranslate();

  const onModalClose = () => {
    setUploadFileList([]);
    onClose();
  };

  return (
    <Modal
      open={open}
      title={t(p("title"))}
      onCancel={onModalClose}
      destroyOnClose={true}
      maskClosable={false}
      footer={[
        <Button key="close" onClick={onModalClose}>
          {t("button.closeButton")}
        </Button>,
      ]}
    >
      <p>
        {t(p("uploadRemark1"))}<strong>{path}</strong>{t(p("uploadRemark2"))}
      </p>
      <p>
        {t(p("uploadRemark3"))}<strong>{publicConfig.CLIENT_MAX_BODY_SIZE}</strong>{t(p("uploadRemark4"))}
      </p>
      <Upload.Dragger
        name="file"
        multiple
        action={async (file) => urlToUpload(cluster, join(path, file.name))}
        withCredentials
        showUploadList={{
          removeIcon: (file) => {
            return (
              <DeleteOutlined
                title={file.status === "uploading" ? t(p("cancelUpload")) : t(p("deleteUploadRecords"))}
              />
            );
          },
        }}
        onChange={({ file, fileList }) => {

          const updatedFileList = [...fileList.filter((f) => f.status)];
          setUploadFileList(updatedFileList);

          if (file.status === "done") {
            message.success(`${file.name}${t(p("successMessage"))}`);
            reload();
          } else if (file.status === "error") {
            message.error(`${file.name}${t(p("errorMessage"))}`);
          }
        }}
        beforeUpload={(file) => {
          const fileMaxSize = parseInt(publicConfig.CLIENT_MAX_BODY_SIZE.slice(0, -1)) * (1024 ** 3);

          if (file.size > fileMaxSize) {
            // message.error(`${file.name}上传失败,文件大小超过${publicConfig.CLIENT_MAX_BODY_SIZE}`);
            message.error(tArgs(p("maxSizeErrorMessage"), [file.name, publicConfig.CLIENT_MAX_BODY_SIZE]));
            return Upload.LIST_IGNORE;
          }

          return new Promise(async (resolve, reject) => {

            const exists = await api.fileExist({ query:{ cluster: cluster, path: join(path, file.name) } });

            if (exists.result) {
              modal.confirm({
                title: t(p("existedModalTitle")),
                content: tArgs(p("existedModalContent"), [file.name]),
                okText: t(p("existedModalOk")),
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
        fileList={uploadFileList}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">{t(p("dragText"))}</p>
        <p className="ant-upload-hint">
          {t(p("hintText"))}
        </p>
      </Upload.Dragger>
    </Modal>
  );
};
