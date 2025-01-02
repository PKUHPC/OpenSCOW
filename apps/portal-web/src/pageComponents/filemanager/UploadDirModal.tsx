import { DeleteOutlined, InboxOutlined } from "@ant-design/icons";
import { App, Button, Modal, Upload } from "antd";
import type { RcFile } from "antd/es/upload";
import type { UploadFile, UploadProps } from "antd/es/upload/interface";
import pLimit from "p-limit";
import { dirname, join } from "path";
import { useEffect, useRef, useState } from "react";
import { api } from "src/apis";
import { prefix, useI18nTranslateToString } from "src/i18n";
import { urlToUpload } from "src/pageComponents/filemanager/api";
import { publicConfig } from "src/utils/config";
import { calculateBlobSHA256 } from "src/utils/file";
import { convertToBytes } from "src/utils/format";

interface Props {
  open: boolean;
  onClose: () => void;
  reload: () => void;
  cluster: string;
  path: string;
  scowdEnabled: boolean;
}

interface UploadProgressEvent {
  percent: number;
}

const p = prefix("pageComp.fileManagerComp.uploadModal.");

type OnProgressCallback = undefined | ((progressEvent: UploadProgressEvent) => void);

export const UploadDirModal: React.FC<Props> = ({ open, onClose, path, reload, cluster, scowdEnabled }) => {
  const { message, modal } = App.useApp();
  const [uploadFileList, setUploadFileList] = useState<UploadFile[]>([]);
  const uploadControllers = useRef(new Map<string, AbortController>());

  // 使用 ref 来追踪每个文件夹的覆盖确认状态
  const folderOverwriteMapRef = useRef<Map<string, boolean>>(new Map());
  // 用于缓存文件夹存在性检查的 Promise
  const folderCheckPromisesRef = useRef<Map<string, Promise<boolean>>>(new Map());
  // 使用 ref 存储已经确认过已存在的目录
  const folderEnsureExistSetRef = useRef<Set<string>>(new Set());
  // 用于缓存目录创建的 Promise
  const folderEnsureExistPromisesRef = useRef<Map<string, Promise<void>>>(new Map());
  // 用于缓存每个文件夹的确认 Promise
  const folderConfirmPromisesRef = useRef<Map<string, Promise<"overwrite" | "skip">>>(new Map());


  const t = useI18nTranslateToString();

  useEffect(() => {
    if (open) {
      setUploadFileList([]);
    }
    return () => {
      setUploadFileList([]);
    };
  }, [open]);

  /**
   * 显示文件夹覆盖确认对话框
   * @param folderName 文件夹名称
   * @returns 用户的选择
   */
  const showConfirmForFolderOverwrite = (folderName: string): Promise<"overwrite" | "skip"> => {
    return new Promise((resolve) => {
      modal.confirm({
        title: "文件夹已存在",
        content: `文件夹 "${folderName}" 已存在，是否覆盖？`,
        okText: "覆盖",
        cancelText: "跳过",
        maskClosable: false,
        centered: true,
        onOk: () => resolve("overwrite"),
        onCancel: () => resolve("skip"),
      });
    });
  };

  /**
   * 检查文件夹是否存在
   * @param folderPath 文件夹名称
   * @returns 文件夹是否存在
   */
  const checkFolderExists = async (folderPath: string, root?: boolean): Promise<boolean> => {
    // If a check is already in progress, return the existing promise
    if (folderCheckPromisesRef.current.has(folderPath)) {
      return folderCheckPromisesRef.current.get(folderPath)!;
    }

    if (root) {
      message.info({
        content: "正在检查上传目录是否存在...",
        key: "checkDir",
        onClose: () => {
          message.info("检查完成...", 2);
        },
      });
    }

    // Create a new check promise and cache it
    const checkPromise = (async () => {
      try {
        const { result } = await api.fileExist({ query: { cluster, path: folderPath } });
        return result;
      } catch {
        message.error(`检查文件夹 ${folderPath} 是否存在失败`);
        return false;
      }
    })().finally(() => {
      folderCheckPromisesRef.current.delete(folderPath);
      message.destroy("checkDir");
    });

    folderCheckPromisesRef.current.set(folderPath, checkPromise);

    return checkPromise;
  };


  /**
   * 确保目录存在，如果不存在则创建它
   * @param folderPath 目录路径
   */
  const ensureDirectoryExists = async (folderPath: string): Promise<void> => {
    // If a creation is already in progress, return the existing promise
    if (folderEnsureExistPromisesRef.current.has(folderPath)) {
      return folderEnsureExistPromisesRef.current.get(folderPath)!;
    }

    // Create a new ensure promise and cache it
    const ensurePromise = (async () => {
      if (!folderEnsureExistSetRef.current.has(folderPath)) {
        const exists = await checkFolderExists(folderPath);
        if (!exists) {
          try {
            await api.mkdir({ body: { cluster, path: folderPath } }).httpError(409, () => {});
          } catch {
            /* Handle mkdir error if necessary */
          }
        }
        folderEnsureExistSetRef.current.add(folderPath);
      }
    })().finally(() => {
      folderEnsureExistPromisesRef.current.delete(folderPath);
    });

    folderEnsureExistPromisesRef.current.set(folderPath, ensurePromise);

    return ensurePromise;
  };

  /**
   * 在 beforeUpload 中判断是否需要上传
   * 针对每个文件夹进行独立的覆盖检查和文件夹创建
   */
  const beforeUploadHandler = async (file: RcFile): Promise<boolean | string> => {
    // 获取文件的相对路径或名称
    const relativePath = file.webkitRelativePath || file.name;
    const folderName = relativePath.split("/")[0];
    const folderPath = join(path, folderName);

    // 检查文件大小
    const fileMaxSize = convertToBytes(publicConfig.CLIENT_MAX_BODY_SIZE);

    if (!scowdEnabled && file.size > fileMaxSize) {
      message.error(t(p("maxSizeErrorMessage"), [file.webkitRelativePath, publicConfig.CLIENT_MAX_BODY_SIZE]));
      return Upload.LIST_IGNORE;
    }

    // 检查该文件夹的覆盖状态
    if (!folderOverwriteMapRef.current.has(folderPath)) {
      // 未检查过该文件夹，进行存在性检查
      const exists = await checkFolderExists(folderPath, true);

      if (exists) {
        // 检查是否已经有一个确认正在进行
        const confirmPromise = folderConfirmPromisesRef.current.get(folderPath);
        if (!confirmPromise) {
          // 如果没有，创建一个新的确认 Promise 并缓存
          const confirmPromise = showConfirmForFolderOverwrite(folderPath);
          folderConfirmPromisesRef.current.set(folderPath, confirmPromise);
        }

        const userChoice = await confirmPromise;
        // 一旦确认完成，移除缓存的 Promise
        folderConfirmPromisesRef.current.delete(folderPath);

        if (userChoice === "overwrite") {
          folderOverwriteMapRef.current.set(folderPath, true);
        } else {
          folderOverwriteMapRef.current.set(folderPath, false);
          return Upload.LIST_IGNORE;
        }
      } else {
        // 文件夹不存在，允许上传
        folderOverwriteMapRef.current.set(folderPath, true);
      }
    }

    // 如果允许上传该文件夹，确保父目录存在
    if (folderOverwriteMapRef.current.get(folderPath)) {
      // 获取文件的父目录路径
      const filePath = join(path, relativePath);
      const parentDir = dirname(filePath);
      try {
        await ensureDirectoryExists(parentDir);
        return true;
      } catch (err) {
        console.error("确保目录存在时出错:", err);
        // 目录创建失败，忽略上传
        return Upload.LIST_IGNORE;
      }
    }

    return Upload.LIST_IGNORE;
  };

  /**
   * 当文件列表变化时，自动开始上传
   * 由于我们使用 customRequest，Upload 组件会自动调用 customRequest
   */
  const handleChange: UploadProps["onChange"] = ({ fileList: newFileList }) => {
    setUploadFileList(newFileList);
  };

  const onModalClose = () => {
    for (const controller of Array.from(uploadControllers.current.values())) {
      controller.abort();
    }

    uploadControllers.current.clear();
    folderCheckPromisesRef.current.clear();
    folderOverwriteMapRef.current.clear();
    folderEnsureExistSetRef.current.clear();
    folderEnsureExistPromisesRef.current.clear();
    folderConfirmPromisesRef.current.clear();
    reload();
    onClose();
  };

  const handleRemove = (file: UploadFile) => {
    const controller = uploadControllers.current.get(file.uid);
    if (controller) {
      controller.abort();
      uploadControllers.current.delete(file.uid);
    }

    return true;
  };

  const startMultipartUpload = async (file: RcFile, onProgress: OnProgressCallback) => {
    // 获取文件的相对路径或名称
    const relativePath = file.webkitRelativePath || file.name;
    const folderName = relativePath.split("/").slice(0, -2).join("/");
    const folderPath = join(path, folderName);

    const { tempFileDir, chunkSizeByte, filesInfo } = await api.initMultipartUpload({
      body: { cluster, path: folderPath, name: file.name },
    });

    const uploadedChunkIndices = new Set(
      filesInfo
        .map((item) => {
          const reg = /_(\d+).scowuploadtemp/;
          const match = reg.exec(item.name);
          return match ? parseInt(match[1]) : null;
        })
        .filter((index) => index !== null),
    );

    const totalCount = Math.ceil(file.size / chunkSizeByte);
    const concurrentChunks = 3;
    let uploadedCount = uploadedChunkIndices.size;

    const uploadFile = uploadFileList.find((uploadFile) => uploadFile.uid === file.uid);
    if (!uploadFile) {
      message.error(t(p("uploadFileListNotExist"), [file.webkitRelativePath]));
      return;
    }

    const updateProgress = (count: number) => {
      uploadedCount += count;
      onProgress?.({ percent: Number(((uploadedCount / totalCount) * 100).toFixed(2)) });
    };

    const controller = new AbortController();
    uploadControllers.current.set(uploadFile.uid, controller);

    const limit = pLimit(concurrentChunks);

    const uploadChunk = async (start: number): Promise<void> => {
      if (controller.signal.aborted) {
        return;
      }

      if (uploadedChunkIndices.has(start + 1)) {
        // 如果文件块已经上传，直接跳过
        return;
      }

      const chunk = file.slice(start * chunkSizeByte, (start + 1) * chunkSizeByte);
      const hash = await calculateBlobSHA256(chunk);
      const fileName = `${hash}_${start + 1}.scowuploadtemp`;

      const formData = new FormData();
      formData.append("file", chunk);

      const response = await fetch(urlToUpload(cluster, join(tempFileDir, fileName)), {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      updateProgress(1);
    };

    try {
      const batchSize = 10; // 每次上传10个文件块
      for (let i = 0; i < totalCount; i += batchSize) {
        const batchPromises: Promise<void>[] = [];
        for (let j = i; j < Math.min(i + batchSize, totalCount); j++) {
          if (controller.signal.aborted) {
            break;
          }
          batchPromises.push(limit(() => uploadChunk(j)));
        }
        await Promise.all(batchPromises);
      }

      if (!controller.signal.aborted) {
        await api
          .mergeFileChunks({ body: { cluster, path: folderPath, name: file.name, sizeByte: file.size } })
          .httpError(520, (err) => {
            message.error(t(p("mergeFileChunksErrorText"), [file.webkitRelativePath]));
            throw err;
          });
      }
    } catch (err: any) {
      message.error(t(p("multipartUploadError"), [err.message]));
      throw err;
    } finally {
      uploadControllers.current.delete(uploadFile.uid);
    }
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
        {"文件夹将被上传到"}<strong>{path}</strong>
        {t(p("uploadRemark2"))}
      </p>
      {!scowdEnabled && (
        <p>
          {t(p("uploadRemark3"))}
          <strong>{publicConfig.CLIENT_MAX_BODY_SIZE}</strong>
          {t(p("uploadRemark4"))}
        </p>
      )}
      <Upload.Dragger
        directory
        name="file"
        multiple
        withCredentials
        {...(scowdEnabled ? {
          customRequest: ({ file, onSuccess, onError, onProgress }) => {
            startMultipartUpload(file as RcFile, onProgress).then(onSuccess).catch(onError);
          },
        } : {
          action: async (file) => urlToUpload(cluster, join(path, file.webkitRelativePath)),
        })}
        showUploadList={{
          removeIcon: (file) => {
            return file.status === "uploading" ? (
              <DeleteOutlined
                onClick={scowdEnabled ? () => handleRemove(file) : undefined}
                title={t(p("cancelUpload"))}
              />
            ) : (
              <DeleteOutlined title={t(p("deleteUploadRecords"))} />
            );
          },
        }}
        beforeUpload={beforeUploadHandler}
        onChange={handleChange}
        onRemove={(file) => {
          setUploadFileList((prev) => prev.filter((item) => item.uid !== file.uid));
          return true;
        }}
        fileList={uploadFileList}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">{t(p("dragText"))}</p>
        <p className="ant-upload-hint">{t(p("hintText"))}</p>
      </Upload.Dragger>
    </Modal>
  );
};
