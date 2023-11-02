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

import Editor, { loader } from "@monaco-editor/react";
import { App, Badge, Modal, Space, Spin, Tabs, Tooltip } from "antd";
import { useState } from "react";
import { api } from "src/apis";
import { prefix, useI18nTranslateToString } from "src/i18n";
import { publicConfig } from "src/utils/config";
import { getLanguage } from "src/utils/staticFiles";

import { urlToUpload } from "./api";

interface Props {
  open: boolean;
  onClose: () => void;
  clusterId: string
  filename: string;
  filePath: string;
}

interface ConfirmModalProps {
  open: boolean;
  saving: boolean;
  onSave: () => Promise<void>;
  onClose: () => void;
}

interface FilenameProps {
  isEdit: boolean;
  filename: string;
}

const p = prefix("pageComp.fileManagerComp.fileEditModal.");

loader.config({
  paths: {
    vs: publicConfig.BASE_PATH + "monaco-assets/vs",
  },
});

function ConfirmModal({ open, saving, onSave, onClose }: ConfirmModalProps) {

  const t = useI18nTranslateToString();

  return (
    <Modal
      title={t(p("prompt"))}
      open={open}
      okText={t(p("save"))}
      closeIcon={null}
      cancelText={t(p("doNotSave"))}
      cancelButtonProps={{ disabled: saving }}
      onOk={onSave}
      confirmLoading={saving}
      onCancel={onClose}
    >
      {t(p("notSavePrompt"))}
    </Modal>
  );
}

const FilenameComponent: React.FC<FilenameProps> = ({ isEdit, filename }) => {

  const t = useI18nTranslateToString();

  return (
    <Tooltip title={isEdit ? t(p("notSaved")) : null}>
      <div>
        <Space size="small">
          <div>{filename}</div>
          { isEdit && <Badge status="processing" /> }
        </Space>
      </div>
    </Tooltip>
  );
};

export const FileEditModal: React.FC<Props> = ({ open, onClose, clusterId, filename, filePath }) => {

  const t = useI18nTranslateToString();

  const [fileContent, setFileContent] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const { message } = App.useApp();

  const handleEdit = (content) => {
    setIsEdit(true);
    setFileContent(content);
  };

  const closeProcess = () => {
    setConfirm(false);
    setIsEdit(false);
    setFileContent("");
    onClose();
  };

  const handleCancel = () => {
    if (!isEdit) {
      closeProcess();
      return;
    }

    setConfirm(true);
  };

  const handleSave = async () => {
    if (!isEdit) {
      closeProcess();
      return;
    }

    setSaving(true);
    const blob = new Blob([fileContent], { type: "text/plain" });

    const formData = new FormData();
    formData.append("file", blob);

    await fetch(urlToUpload(clusterId, filePath), {
      method: "POST",
      body: formData,
    }).then((response) => {
      if (!response.ok) {
        return Promise.reject(response.statusText);
      }
      message.success(t(p("saveFileSuccess")));
      closeProcess();
    }).catch((error) => {
      message.error(t(p("saveFileFail"), [error]));
    }).finally(() => setSaving(false));
  };

  const downloadFile = () => {

    if (!open) {
      return;
    }

    setLoading(true);
    api.downloadFile({
      query: { download: false, path: filePath, cluster: clusterId },
    }).then((json) => {
      setFileContent(JSON.stringify(json, null, 2));
    }).catch(async (res: Response) => {

      if (!res.ok) {
        message.error(t(p("failedGetFile"), [filename]));
        return;
      }

      setLoading(false);
      const reader = res.body?.getReader();
      if (reader) {

        let fileContent = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }
          fileContent += new TextDecoder().decode(value);
          setFileContent(fileContent);
        }

      } else {
        message.error(t(p("cantReadFile"), [filename]));
      }

    }).finally(() => {
      setLoading(false);
    });

  };

  return (
    <div>
      <Modal
        open={open}
        afterOpenChange={downloadFile}
        title={t(p("fileEdit"))}
        okText={t(p("save"))}
        closeIcon={null}
        onOk={handleSave}
        confirmLoading={saving}
        onCancel={handleCancel}
        cancelButtonProps={{ disabled: saving }}
        width={1000}
        maskClosable={false}
      >
        <Tabs
          type="card"
          items={[{
            label: <FilenameComponent isEdit={isEdit} filename={filename} />,
            key: `${filename}`,
            children: (
              <Spin spinning={loading}>
                <Editor
                  height="60vh"
                  defaultLanguage={getLanguage(filename)}
                  value={fileContent}
                  onChange={handleEdit}
                />
              </Spin>
            ),
          }]}
        />
      </Modal>
      <ConfirmModal
        open={confirm}
        saving={saving}
        onSave={handleSave}
        onClose={closeProcess}
      />
    </div>
  );
};
