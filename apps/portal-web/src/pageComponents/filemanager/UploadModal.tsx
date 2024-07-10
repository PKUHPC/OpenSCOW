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
import { GetServerSideProps } from "next";
import { join } from "path";
import { useEffect, useRef, useState } from "react";
import { api } from "src/apis";
import { USE_MOCK } from "src/apis/useMock";
import { getTokenFromCookie } from "src/auth/cookie";
import { AuthResultError, ssrAuthenticate } from "src/auth/server";
import { UnifiedErrorPage } from "src/components/errorPages/UnifiedErrorPage";
import { prefix, useI18nTranslateToString } from "src/i18n";
import { urlToUpload } from "src/pageComponents/filemanager/api";
import { publicConfig } from "src/utils/config";
import { generateMD5FromFileName, getFileChunkSize } from "src/utils/file";
import { convertToBytes } from "src/utils/format";

interface ServerSideProps {
  error?: AuthResultError;
  scowdEnabledClusters?: string[];
}

interface Props extends ServerSideProps {
  open: boolean;
  onClose: () => void;
  reload: () => void;
  cluster: string;
  path: string;
}

interface FileChunk {
  file: Blob;
  fileName: string;
}

interface UploadProgressEvent {
  percent: number;
}

const p = prefix("pageComp.fileManagerComp.uploadModal.");

type OnProgressCallback = undefined | ((progressEvent: UploadProgressEvent) => void);

export const UploadModal: React.FC<Props> = ({ open, onClose, path, reload, cluster, error, scowdEnabledClusters }) => {

  if (error) {
    return <UnifiedErrorPage code={error} />;
  }

  const { message, modal } = App.useApp();
  const [ uploadFileList, setUploadFileList ] = useState<UploadFile[]>([]);
  const [ scowdEnabled, _ ] = useState<boolean>(!!scowdEnabledClusters?.includes(cluster));

  const t = useI18nTranslateToString();

  // 关闭modal框时，用于停止所有后续文件上传
  const isUploadingCancelled = useRef(false);

  const onModalClose = () => {
    isUploadingCancelled.current = true;
    setUploadFileList([]);
    onClose();
  };

  useEffect(() => {
  // 每次打开模态框时，重置取消上传的状态
    if (open) {
      isUploadingCancelled.current = false;
    }
  }, [open]);


  const startBreakpointUpload = async (file: File, onProgress: OnProgressCallback) => {
    // 获取文件唯一标识
    const { md5, suffix } = generateMD5FromFileName(file);

    const { items } = await api.listFile({ query: { cluster, path: join(path, md5) } });

    const uploadedChunks = items.sort((a, b) => {
      const reg = /_(\d+)/;
      const matchA = reg.exec(a.name);
      const matchB = reg.exec(b.name);

      if (matchA && matchB) {
        return parseInt(matchA[1]) - parseInt(matchB[1]);
      } else {
        return 0;
      }
    }).map((item) => item.name);

    // 给文件按块大小算出每块大小和总数
    const { chunkSize, totalCount } = getFileChunkSize(file);

    // 并发上传数
    const concurrentChunks = 5;

    // 跟踪已上传的块数
    let uploadedCount = uploadedChunks.length;

    onProgress?.({ percent:Number(((uploadedCount / totalCount) * 100).toFixed(2)) });

    // 更新进度条
    const updateProgress = () => {
      uploadedCount++;
      onProgress?.({ percent: Number((uploadedCount / totalCount * 100).toFixed(2)) });
    };

    for (let i = 0; i < totalCount; i += concurrentChunks) {
      if (isUploadingCancelled.current) {
        throw new Error("Upload cancelled");
      }

      const chunks: FileChunk[] = [];
      for (let start = i; start < totalCount && start < i + concurrentChunks; start++) {
        const chunk = file.slice(start * chunkSize, (start + 1) * chunkSize);
        const fileName = `${md5}_${start + 1}.${suffix}`;

        if (!uploadedChunks.includes(fileName)) {
          chunks.push({
            file: chunk,
            fileName,
          });
        }
      }

      const formDataArray = chunks.map((chunk) => {
        const formData = new FormData();
        formData.append("file", chunk.file);
        formData.append("fileMd5Name", chunk.fileName);
        return formData;
      });

      const uploadPromises = formDataArray.map((formData) =>
        fetch(urlToUpload(cluster, path), {
          method: "POST",
          body: formData,
        }).then((response) => {
          if (!response.ok) {
            return new Error(response.statusText);
          }
          updateProgress();
          return response;
        }).catch((error) => {
          message.error("报错错误", error);
        }),
      );

      // 等待当前批次上传完成
      await Promise.all(uploadPromises);
    }

    await api.mergeFileChunks({ body: { cluster, path, md5, name: file.name } });
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
        {...(scowdEnabled ? {
          customRequest: ({ file, onSuccess, onError, onProgress }) => {
            startBreakpointUpload(file as File, onProgress).then(onSuccess).catch(onError);
          },
        } : {
          action: async (file) => urlToUpload(cluster, join(path, file.name)),
        })}
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
          const fileMaxSize = convertToBytes(publicConfig.CLIENT_MAX_BODY_SIZE);

          if (file.size > fileMaxSize) {
            message.error(t(p("maxSizeErrorMessage"), [file.name, publicConfig.CLIENT_MAX_BODY_SIZE]));
            return Upload.LIST_IGNORE;
          }

          return new Promise((resolve, reject) => {

            api.fileExist({ query:{ cluster: cluster, path: join(path, file.name) } }).then(({ result }) => {
              if (result) {
                modal.confirm({
                  title: t(p("existedModalTitle")),
                  content: t(p("existedModalContent"), [file.name]),
                  okText: t(p("existedModalOk")),
                  onOk: async () => {
                    const fileType = await api.getFileType({ query:{ cluster: cluster, path: join(path, file.name) } });
                    const deleteOperation = fileType.type === "dir" ? api.deleteDir : api.deleteFile;
                    await deleteOperation({ query: { cluster: cluster, path: join(path, file.name) } })
                      .then(() => resolve(file));
                  },
                  // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
                  onCancel: () => { reject(file); },
                });
              } else {
                resolve(file);
              }

            });


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

export const getServerSideProps: GetServerSideProps<ServerSideProps> = async ({ req }) => {

  // Cannot directly call api routes here, so mock is not available directly.
  // manually call mock
  if (USE_MOCK) {
    return {
      props: {
        scowdEnabledClusters: [ "hpc01" ],
      },
    };
  }

  const auth = ssrAuthenticate(() => true);

  const info = await auth(req);
  if (typeof info === "number") {
    return { props: { error: info } };
  }

  const token = getTokenFromCookie({ req });
  const resp = await api.getClusterConfigFiles({ query: { token } });

  const scowdEnabledClusters: string[] = Object.entries(resp.clusterConfigs)
    .filter(([_, config]) => !!config.scowd?.enabled)
    .map(([cluster, _]) => cluster);

  return {
    props: {
      scowdEnabledClusters,
    },
  };
};

