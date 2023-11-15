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

import { CloseOutlined, FullscreenExitOutlined, FullscreenOutlined } from "@ant-design/icons";
import Editor, { loader } from "@monaco-editor/react";
import { App, Badge, Button, Modal, Space, Spin, Tabs, Tooltip } from "antd";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { api } from "src/apis";
import { prefix, useI18nTranslateToString } from "src/i18n";
import { publicConfig } from "src/utils/config";
import { convertToBytes } from "src/utils/format";
import { getLanguage } from "src/utils/staticFiles";
import { styled } from "styled-components";

import { urlToUpload } from "./api";

const StyledTabs = styled(Tabs)`
  .ant-tabs-nav {
    margin: 0 !important;
  }
`;

enum Mode {
  EDIT = "EDIT",
  PREVIEW = "PREVIEW",
};

enum ExitType {
  EXIT_EDIT,
  CLOSE,
}

const FullScreenModalStyle = styled.div`
  .ant-modal {
    transition: width 0.3s ease, height 0.3s ease;
  }

  &.fullscreen {
    .ant-modal {
      width: 98vw !important;
      height: 100vh !important;
      top: 0 !important;
      padding: 0 !important;
      margin: auto !important;
      max-width: 100vw !important;
    }

    .ant-modal-content {
      height: 100%;
    }

    .ant-modal-body {
      height: calc(100% - 100px);
      overflow-y: auto;
    }
  }
`;

interface PreviewFileProps {
  open: boolean;
  filename: string;
  fileSize: number;
  filePath: string;
  clusterId: string;
}
interface Props {
  previewFile: PreviewFileProps;
  setPreviewFile: Dispatch<SetStateAction<PreviewFileProps>>;
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

const DEFAULT_FILE_EDIT_LIMIT_SIZE = "1m";

const p = prefix("pageComp.fileManagerComp.fileEditModal.");

loader.config({
  paths: {
    vs: publicConfig.BASE_PATH + "monaco-assets/vs",
  },
});

function ConfirmModal({ open, saving, onSave, onClose }: ConfirmModalProps) {

  const t = useI18nTranslateToString();

  const handleSave = async () => {
    await onSave();
    onClose();
  };

  return (
    <Modal
      title={t(p("prompt"))}
      open={open}
      okText={t(p("save"))}
      closeIcon={null}
      cancelText={t(p("doNotSave"))}
      cancelButtonProps={{ disabled: saving }}
      onOk={handleSave}
      confirmLoading={saving}
      onCancel={onClose}
      maskClosable={false}
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

export const FileEditModal: React.FC<Props> = ({ previewFile, setPreviewFile }) => {

  const t = useI18nTranslateToString();

  const { open, filename, fileSize, filePath, clusterId } = previewFile;

  const [mode, setMode] = useState<Mode>(Mode.PREVIEW);
  const [fileContent, setFileContent] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [exitType, setExitType] = useState<ExitType>(ExitType.CLOSE);
  const [isFullScreen, setIsFullScreen] = useState(false);


  const [options, setOptions] = useState({
    readOnly: true,
    lineNumbersMinChars: 7,
  });

  useEffect(() => {
    if (open) {
      downloadFile();
    }
  }, [open]);

  const { message } = App.useApp();

  const handleEdit = (content) => {
    if (content && !downloading) {
      setIsEdit(true);
      setFileContent(content);
    }
  };

  const closeProcess = () => {
    setConfirm(false);
    setIsEdit(false);
    setMode(Mode.PREVIEW);
    setFileContent("");
    setIsFullScreen(false);
    setOptions({
      ...options,
      readOnly: true,
    });
    setPreviewFile({
      ...previewFile,
      open: false,
    });
  };

  const handleClose = () => {
    if (!isEdit) {
      closeProcess();
      return;
    }

    setExitType(ExitType.CLOSE);
    setConfirm(true);
  };

  const exitEditModeProcess = () => {
    downloadFile();
    setConfirm(false);
    setIsEdit(false);
    setMode(Mode.PREVIEW);
    setOptions({
      ...options,
      readOnly: true,
    });
  };

  const handleExitEditMode = () => {
    if (!isEdit) {
      exitEditModeProcess();
      return;
    }

    setExitType(ExitType.EXIT_EDIT);
    setConfirm(true);
  };

  const handleSave = async () => {

    setSaving(true);
    const blob = new Blob([fileContent], { type: "text/plain" });

    const formData = new FormData();
    formData.append("file", blob);

    await fetch(urlToUpload(clusterId, filename), {
      method: "POST",
      body: formData,
    }).then((response) => {
      if (!response.ok) {
        return Promise.reject(response.statusText);
      }
      message.success(t(p("saveFileSuccess")));
      setIsEdit(false);
    }).catch((error) => {
      message.error(t(p("saveFileFail"), [error]));
    }).finally(() => {
      setSaving(false);
    });

  };

  const downloadFile = () => {
    if (!open) {
      return;
    }

    setLoading(true);
    setDownloading(true);
    api.downloadFile({
      query: { download: false, path: filePath, cluster: clusterId },
    }).then((json) => {
      setFileContent(JSON.stringify(json, null, 2));
    }).catch(async (res: Response) => {

      if (!res.ok) {
        message.error(t(p("failedGetFile"), [filename]));
        return;
      }

      const reader = res.body?.getReader();
      if (reader) {
        let accumulatedChunks = "";
        let accumulatedSize = 0;
        const CHUNK_SIZE = 3 * 1024 * 1024;
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            setFileContent(() => {
              return accumulatedChunks;
            });
            break;
          }
          const chunk = decoder.decode(value, { stream: true });
          accumulatedChunks += chunk;
          accumulatedSize += chunk.length;

          if (accumulatedSize > CHUNK_SIZE) {
            setFileContent(() => {
              return accumulatedChunks;
            });
            accumulatedSize = 0;
            setLoading(false);
          }
        }
      } else {
        message.error(t(p("cantReadFile"), [filename]));
      }

    }).finally(() => {
      setLoading(false);
      setDownloading(false);
    });

  };

  const modalTitle = (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span>{mode === "PREVIEW" ? t(p("filePreview")) : t(p("fileEdit"))}</span>
      <div style={{ position: "relative", top: "-2px" }}>
        <Button
          style={{ marginBottom: 2, color: "#8c8c8c" }}
          type="text"
          onClick={() => setIsFullScreen(!isFullScreen)}
          icon={isFullScreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
        />
        <Button
          style={{ color: "#8c8c8c" }}
          type="text"
          onClick={handleClose}
          icon={<CloseOutlined />}
        />
      </div>

    </div>
  );

  const modalFooterRender = () => {
    return (
      mode === Mode.PREVIEW ? (
        fileSize <= convertToBytes(publicConfig.FILE_EDIT_SIZE || DEFAULT_FILE_EDIT_LIMIT_SIZE)
          ? (
            <Button
              type="primary"
              onClick={() => {
                setMode(Mode.EDIT);
                setOptions({
                  ...options,
                  readOnly: false,
                });
              }}
            >
              {t(p("edit"))}
            </Button>
          )
          : (
            <Tooltip
              title={downloading ? t(p("fileLoading")) : t(p("fileSizeExceeded"))}
            >
              <Button disabled={true}>{t(p("edit"))}</Button>
            </Tooltip>
          )
      ) : (
        <Space>
          <Button type="primary" disabled={!isEdit} loading={saving} onClick={handleSave}>{t(p("save"))}</Button>
          <Button
            disabled={saving}
            onClick={() => {
              handleExitEditMode();
            }}
          >{t(p("exitEdit"))}</Button>
        </Space>

      )
    );
  };

  return (
    <FullScreenModalStyle className={isFullScreen ? "fullscreen" : ""}>
      <Modal
        open={open}
        onCancel={handleClose}
        title={modalTitle}
        footer={modalFooterRender()}
        getContainer={false}
        width={1000}
        maskClosable={false}
        closeIcon={null}
      >
        <StyledTabs
          type="card"
          items={[{
            label: <FilenameComponent isEdit={isEdit} filename={filename} />,
            key: `${filename}`,
            children: (
              <Spin spinning={loading}>
                <Editor
                  height={isFullScreen ? "78vh" : "60vh"}
                  defaultLanguage={getLanguage(filename)}
                  options={options}
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
        onClose={() => exitType === ExitType.CLOSE ? closeProcess() : exitEditModeProcess()}
      />
    </FullScreenModalStyle>
  );
};
