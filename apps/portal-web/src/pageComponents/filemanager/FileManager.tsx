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

import { CloseOutlined,
  CopyOutlined,
  DeleteOutlined, FileAddOutlined, FileOutlined, FolderAddOutlined,
  FolderOutlined, HomeOutlined, LeftOutlined, MacCommandOutlined, RightOutlined,
  ScissorOutlined, SnippetsOutlined, UploadOutlined, UpOutlined } from "@ant-design/icons";
import { Button, Divider, Space, Table } from "antd";
import Link from "next/link";
import Router from "next/router";
import { join } from "path";
import React, { useEffect, useRef, useState } from "react";
import { api } from "src/apis/api";
import { FilterFormContainer } from "src/components/FilterFormContainer";
import { ModalButton, ModalLink } from "src/components/ModalLink";
import { TitleText } from "src/components/PageTitle";
import { TableTitle } from "src/components/TableTitle";
import { useMessage, useModal } from "src/layouts/prompts";
import { urlToDownload } from "src/pageComponents/filemanager/api";
import { CreateFileModal } from "src/pageComponents/filemanager/CreateFileModal";
import { MkdirModal } from "src/pageComponents/filemanager/MkdirModal";
import { PathBar } from "src/pageComponents/filemanager/PathBar";
import { RenameModal } from "src/pageComponents/filemanager/RenameModal";
import { UploadModal } from "src/pageComponents/filemanager/UploadModal";
import { FileInfo, FileType } from "src/pages/api/file/list";
import { publicConfig } from "src/utils/config";
import { compareDateTime, formatDateTime } from "src/utils/datetime";
import { compareNumber } from "src/utils/math";
import styled from "styled-components";

interface Props {
  cluster: string;
  path: string;
  urlPrefix: string;
}

const fileTypeIcons = {
  "file": FileOutlined,
  "dir": FolderOutlined,
  "error": CloseOutlined,
} as Record<FileType, React.ComponentType>;

const TopBar = styled(FilterFormContainer)`
  display: flex;
  flex-direction: row;
  padding-bottom: 8px;

  &>button {
    margin: 0px 4px;
  }
`;

const OperationBar = styled(TableTitle)`
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 4px;
`;

const nodeModeToString = (mode: number) => {
  const numberPermission = (mode & parseInt("777", 8)).toString(8);

  const toStr = (char: string) => {
    const num = +char;
    return ((num & 4) !== 0 ? "r" : "-") + ((num & 2) !== 0 ? "w" : "-") + ((num & 1) !== 0 ? "x" : "-");
  };

  return [0, 1, 2].reduce((prev, curr) => prev + toStr(numberPermission[curr]), "");
};

type FileInfoKey = React.Key;

const fileInfoKey = (f: FileInfo, path: string): FileInfoKey => join(path, f.name);

interface Operation {
  op: "copy" | "move";
  originalPath: string
  started: boolean;
  selected: FileInfo[];
  completed: FileInfo[];
}

const operationTexts = {
  copy: "复制",
  move: "移动",
};

export const FileManager: React.FC<Props> = ({ cluster, path, urlPrefix }) => {

  const modal = useModal();
  const message = useMessage();

  const prevPathRef = useRef<string>(path);

  const [files, setFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<FileInfoKey[]>([]);

  const [operation, setOperation] = useState<Operation | undefined>(undefined);

  const reload = async (signal?: AbortSignal) => {
    setLoading(true);
    await api.listFile({ query: { cluster, path } }, signal)
      .then((d) => {
        setFiles(d.items);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const fullUrl = (path: string) => join(urlPrefix, cluster, path);

  const up = () => {
    const paths = path.split("/");

    const newPath = paths.length === 1
      ? path : "/" + paths.slice(0, paths.length - 1).join("/");

    Router.push(fullUrl(newPath));
  };

  const toHome = () => {
    Router.push(fullUrl("~"));
  };

  const back = () => {
    Router.back();
  };

  const forward = () => {
    history.forward();
  };


  useEffect(() => {
    if (path === "~") {
      return;
    }

    setSelectedKeys([]);

    reload()
      .then(() => { prevPathRef.current = path; })
      .catch(() => {
        if (prevPathRef.current !== path) {
          Router.push(fullUrl(prevPathRef.current));
        }
      });
  }, [path]);

  const resetSelectedAndOperation = () => {
    setSelectedKeys([]);
    setOperation(undefined);
  };


  const paste = async () => {
    if (!operation) { return; }

    const operationText = operationTexts[operation.op];

    setOperation({ ...operation, started: true });

    const operationApi = operation.op === "copy" ? api.copyFileItem : api.moveFileItem;

    // if only one file is selected, show detailed error information
    const pasteOneFile = async (fromPath: string, toPath: string) => {
      await operationApi({ body: { cluster, fromPath, toPath } })
        .httpError(415, ({ error }) => {
          modal.error({
            title: `${operationText}出错`,
            content: error,
          });
        })
        .then(() => {
          message.success(`${operationText}成功！`);
        }).finally(() => {
          resetSelectedAndOperation();
          reload();
        });
    };
    // if multiple files are selected, don't show error for each file
    const pasteFiles = async (file: FileInfo, fromPath: string, toPath: string) => {
      await operationApi({ body: { cluster, fromPath, toPath } })
        .then(() => {
          setOperation((o) => o ? { ...operation, completed: o.completed.concat(file) } : undefined);
          return file;
        }).catch(() => {
          return undefined;
        });
    };

    if (operation.selected.length === 1) {
      const filename = operation.selected[0].name;
      const fromPath = join(operation.originalPath, filename);
      const toPath = join(path, filename);
      const exists = await api.fileExist({ query: { cluster, path: toPath } });
      if (exists.result) {
        modal.confirm({
          title: "文件/目录已存在",
          content: `文件/目录${filename}已存在，是否覆盖？`,
          okText: "确认",
          onOk: async () => {
            const fileType = await api.getFileType({ query: { cluster, path: toPath } });
            const deleteOperation = fileType.type === "dir" ? api.deleteDir : api.deleteFile;
            await deleteOperation({ body: { cluster: cluster, path: toPath } });
            await pasteOneFile(fromPath, toPath);
          },
          onCancel: () => {
            resetSelectedAndOperation();
            reload();
          },
        });
      } else {
        await pasteOneFile(fromPath, toPath);
      }
      return;
    }

    await Promise.allSettled(operation.selected.map(async (x) => {
      const exists = await api.fileExist({ query: { cluster, path: join(path, x.name) } });
      if (exists.result) {
        modal.confirm({
          title: "文件/目录已存在",
          content: `文件/目录${x.name}已存在，是否覆盖？`,
          okText: "确认",
          onOk: async () => {
            const fileType = await api.getFileType({ query: { cluster, path: join(path, x.name) } });
            const deleteOperation = fileType.type === "dir" ? api.deleteDir : api.deleteFile;
            await deleteOperation({ body: { cluster: cluster, path: join(path, x.name) } });
            await pasteFiles(x, join(operation.originalPath, x.name), join(path, x.name));
          },
        });
      } else {
        await pasteFiles(x, join(operation.originalPath, x.name), join(path, x.name));
      }
    }))
      .then((successfulInfo) => {
        const successfulCount = successfulInfo.filter((x) => x).length;
        const allCount = operation.selected.length;
        if (successfulCount === allCount) {
          message.success(`${operationText}${allCount}项成功！`);
          resetSelectedAndOperation();
        } else {
          message.error(`${operationText}成功${successfulCount}项，失败${allCount - successfulCount}项`);
        }
      })
      .catch((e) => {
        console.log(e);
        message.error(`执行${operationText}操作时遇到错误`);
      })
      .finally(() => {
        resetSelectedAndOperation();
        reload();
      });

  };

  const onDeleteClick = () => {
    const files = keysToFiles(selectedKeys);
    modal.confirm({
      title: "确认删除",
      okText: "确认",
      content: `确认要删除选中的${files.length}项？`,
      onOk: async () => {
        await Promise.allSettled(files.map(async (x) => {
          return (x.type === "file" ? api.deleteFile : api.deleteDir)({
            body: {
              cluster,
              path: join(path, x.name),
            },
          }).then(() => x).catch(() => undefined);
        }))
          .then((successfulInfo) => {
            const failedCount = successfulInfo.filter((x) => !x).length;
            const allCount = files.length;
            if (failedCount === 0) {
              message.success(`删除${allCount}项成功！`);
              resetSelectedAndOperation();
            } else {
              message.error(`删除成功${allCount - failedCount}项，失败${failedCount}项`);
              setOperation((o) => o && ({ ...o, started: false }));
            }
          }).catch((e) => {
            console.log(e);
            message.error("执行删除操作时遇到错误");
            setOperation((o) => o && ({ ...o, started: false }));
            setSelectedKeys([]);
          }).finally(() => {
            setOperation(undefined);
            reload();
          });
      },
    });

  };

  const keysToFiles = (keys: React.Key[]) => {
    return files.filter((x) => keys.includes(fileInfoKey(x, path)));
  };

  return (
    <div>
      <TitleText>
        <span>
        集群{publicConfig.CLUSTERS_CONFIG[cluster]?.displayName ?? cluster}文件管理
        </span>
      </TitleText>
      <TopBar>
        <Button onClick={back} icon={<LeftOutlined />} shape="circle" />
        <Button onClick={forward} icon={<RightOutlined />} shape="circle" />
        <Button onClick={toHome} icon={<HomeOutlined />} shape="circle" />
        <Button onClick={up} icon={<UpOutlined />} shape="circle" />
        <PathBar
          path={path}
          reload={reload}
          go={(path) => Router.push(fullUrl(path))}
          loading={loading}
          fullUrl={fullUrl}
        />
      </TopBar>
      <OperationBar>
        <Space wrap>
          <UploadButton
            cluster={cluster}
            path={path}
            reload={reload}
          >
            上传文件
          </UploadButton>
          <Divider type="vertical" />
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={onDeleteClick}
            disabled={selectedKeys.length === 0 || operation?.started}
          >
            删除选中
          </Button>
          <Button
            icon={<CopyOutlined />}
            onClick={() =>
              setOperation({ op: "copy",
                selected: keysToFiles(selectedKeys), originalPath: path, started: false, completed: [],
              })}
            disabled={selectedKeys.length === 0 || operation?.started}
          >
            复制选中
          </Button>
          <Button
            icon={<ScissorOutlined />}
            onClick={() =>
              setOperation({ op:"move",
                selected: keysToFiles(selectedKeys), originalPath: path, started: false, completed: []})}
            disabled={selectedKeys.length === 0 || operation?.started}
          >
            移动选中
          </Button>
          <Button
            icon={<SnippetsOutlined />}
            onClick={paste}
            disabled={!operation || operation.started || operation.originalPath === path}
          >
            粘贴到此处
          </Button>
          {
            operation ? (
              operation.started ? (
                <span>
                  {`正在${operationTexts[operation.op]}，` +
                  `已完成：${operation.completed.length} / ${operation.selected.length}`}
                </span>
              ) : (
                <span>
                  {`已选择${operationTexts[operation.op]}${operation.selected.length}个项`}
                  <a onClick={() => setOperation(undefined)} style={{ marginLeft: "4px" }}>
                  取消
                  </a>
                </span>
              )) : ""
          }
        </Space>
        <Space wrap>
          {
            publicConfig.ENABLE_SHELL ? (
              <Link href={`/shell/${cluster}${path}`} target="_blank" legacyBehavior>
                <Button icon={<MacCommandOutlined />}>
                  在终端中打开
                </Button>
              </Link>
            ) : null
          }
          <CreateFileButton
            cluster={cluster}
            path={path}
            reload={reload}
          >
            新文件
          </CreateFileButton>
          <MkdirButton
            cluster={cluster}
            path={path}
            reload={reload}
          >
            新目录
          </MkdirButton>
        </Space>
      </OperationBar>
      <Table
        dataSource={files}
        loading={loading}
        pagination={false}
        size="small"
        rowKey={(r) => fileInfoKey(r, path)}
        scroll={{ x: true }}
        rowSelection={{
          selectedRowKeys: selectedKeys,
          onChange: (keys) => setSelectedKeys(keys),
        }}
        onRow={(r) => ({
          onClick: () => {
            setSelectedKeys([fileInfoKey(r, path)]);
          },
          onDoubleClick: () => {
            if (r.type === "dir") {
              Router.push(fullUrl(join(path, r.name)));
            } else if (r.type === "file") {
              const href = urlToDownload(cluster, join(path, r.name), false);
              openPreviewLink(href);
            }
          },
        })}
      >
        <Table.Column<FileInfo>
          dataIndex="type"
          title=""
          width="32px"
          defaultSortOrder={"ascend"}
          sorter={(a, b) => a.type.localeCompare(b.type)}
          sortDirections={["ascend", "descend"]}
          render={(_, r) => (
            React.createElement(fileTypeIcons[r.type])
          )}
        />

        <Table.Column<FileInfo>
          dataIndex="name"
          title="文件名"
          sorter={(a, b) => a.name.localeCompare(b.name)}
          sortDirections={["ascend", "descend"]}
          render={(_, r) => (
            r.type === "dir" ? (
              <Link href={join(urlPrefix, cluster, path, r.name)} passHref>
                {r.name}
              </Link>
            ) : (
              <a onClick={() => {
                const href = urlToDownload(cluster, join(path, r.name), false);
                openPreviewLink(href);
              }}
              >
                {r.name}
              </a>
            )
          )}
        />

        <Table.Column<FileInfo>
          dataIndex="mtime"
          title="修改日期"
          render={(mtime: string | undefined) => mtime ? formatDateTime(mtime) : ""}
          sorter={(a, b) => compareDateTime(a.mtime, b.mtime) }
        />

        <Table.Column<FileInfo>
          dataIndex="size"
          title="大小"
          render={(size: number | undefined) => size === undefined ? "" : Math.floor(size / 1024) + " KB"}
          sorter={(a, b) => compareNumber(a.size, b.size) }
        />

        <Table.Column<FileInfo>
          dataIndex="mode"
          title="权限"
          render={(mode: number | undefined) => mode === undefined ? "" : nodeModeToString(mode)}
        />

        <Table.Column<FileInfo>
          dataIndex="action"
          title="操作"
          render={(_, i: FileInfo) => (
            <Space>
              {
                i.type === "file" ? (
                  <a href={urlToDownload(cluster, join(path, i.name), true)}>
                下载
                  </a>
                ) : undefined
              }
              <RenameLink
                cluster={cluster}
                path={join(path, i.name)}
                reload={reload}
              >
                重命名
              </RenameLink>
              <a onClick={() => {
                const fullPath = join(path, i.name);
                modal.confirm({
                  title: "确认删除",
                  // icon: < />,
                  content: `确认删除${fullPath}？`,
                  okText: "确认",
                  onOk: async () => {
                    await (i.type === "file" ? api.deleteFile : api.deleteDir)({
                      body: {
                        cluster,
                        path: fullPath,
                      },
                    })
                      .then(() => {
                        message.success("删除成功！");
                        resetSelectedAndOperation();
                        reload();
                      });
                  },
                });
              }}
              >
                删除
              </a>
            </Space>
          )}
        />

      </Table>
    </div>
  );
};

const RenameLink = ModalLink(RenameModal);
const CreateFileButton = ModalButton(CreateFileModal, { icon: <FileAddOutlined /> });
const MkdirButton = ModalButton(MkdirModal, { icon: <FolderAddOutlined /> });
const UploadButton = ModalButton(UploadModal, { icon: <UploadOutlined /> });


function openPreviewLink(href: string) {
  window.open(href, "ViewFile", "location=yes,resizable=yes,scrollbars=yes,status=yes");
}
