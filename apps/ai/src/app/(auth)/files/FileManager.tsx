/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * OpenSCOW is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import { CopyOutlined, DatabaseOutlined, DeleteOutlined, EyeInvisibleOutlined, EyeOutlined,
  FileAddOutlined, FolderAddOutlined, HomeOutlined, MacCommandOutlined,
  ScissorOutlined, SnippetsOutlined, UploadOutlined, UpOutlined } from "@ant-design/icons";
import { getI18nConfigCurrentText } from "@scow/lib-web/build/utils/systemLanguage";
import type { inferRouterOutputs } from "@trpc/server";
import { App, Button, Divider, Modal, Space } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { join } from "path";
import React, { useEffect, useRef, useState } from "react";
import { usePublicConfig } from "src/app/(auth)/context";
import { useOperation } from "src/app/(auth)/files/[cluster]/context";
import { FilterFormContainer } from "src/components/FilterFormContainer";
import { MkdirModal } from "src/components/MkdirModal";
import { ModalButton, ModalLink } from "src/components/ModalLink";
import { TitleText } from "src/components/PageTitle";
import { TableTitle } from "src/components/TableTitle";
import { UploadModal } from "src/components/UploadModal";
import { Cluster } from "src/server/trpc/route/config";
import { AppRouter } from "src/server/trpc/router";
import { trpc } from "src/utils/trpc";
import { styled } from "styled-components";

import { urlToDownload } from "./api";
import { CreateFileModal } from "./CreateFileModal";
import { FileTable } from "./FileTable.jsx";
import { PathBar } from "./PathBar";
import { RenameModal } from "./RenameModal";

interface Props {
  cluster: Cluster;
  loginNodes: Record<string, string>;
  path: string;
  urlPrefix: string;
}

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

type FileInfoKey = React.Key;

type FileInfo = inferRouterOutputs<AppRouter>["file"]["listDirectory"][0];

const fileInfoKey = (f: FileInfo, path: string): string => join(path, f.name);

interface PromiseSettledResult {
  status: string;
  value?: FileInfo | undefined;
}

const operationTexts = {
  copy: "复制",
  move: "移动",
};

export const FileManager: React.FC<Props> = ({ cluster, loginNodes, path, urlPrefix }) => {

  const { message, modal } = App.useApp();
  const router = useRouter();
  const { publicConfig } = usePublicConfig();

  const prevPathRef = useRef<string>(path);

  const [selectedKeys, setSelectedKeys] = useState<FileInfoKey[]>([]);
  const { operation, setOperation } = useOperation();
  const [showHiddenFile, setShowHiddenFile] = useState(false);

  const filesQuery = trpc.file.listDirectory.useQuery({
    clusterId: cluster.id, path,
  }, { enabled: path !== "~" });

  const loginNodeAddress = loginNodes[cluster.id];

  const reload = filesQuery.refetch;

  const fullUrl = (path: string) => join(urlPrefix, cluster.id, path);

  const up = () => {
    const paths = path.split("/");

    const newPath = paths.length === 1
      ? path : "/" + paths.slice(0, paths.length - 1).join("/");
    router.replace(fullUrl(newPath));
  };

  const toHome = () => {
    router.push(fullUrl("~"));
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
          router.push(fullUrl(prevPathRef.current));
        }
      });
  }, [path]);

  const resetSelectedAndOperation = () => {
    setSelectedKeys([]);
    setOperation(undefined);
  };


  const copyOrMoveMutation = trpc.file.copyOrMove.useMutation({
    onError(error) {
      const operationText = operationTexts[operation!.op];

      if (error.data?.code === "CONFLICT") {
        Modal.error({
          title: `${operationText}失败`,
          content: "存在相同的目录或文件",
        });
        return;
      }

      Modal.error({
        title: `${operationText}失败`,
        content: error.message,
      });
    },
    onSettled() {
      resetSelectedAndOperation();
      reload();
    },
  });

  const paste = async () => {
    if (!operation) { return; }
    const operationText = operationTexts[operation.op];

    setOperation({ ...operation, started: true });

    // if only one file is selected, show detailed error information
    if (operation.selected.length === 1) {
      const filename = operation.selected[0].name;
      const fromPath = join(operation.originalPath, filename);

      copyOrMoveMutation.mutate({
        op: operation.op,
        clusterId: cluster.id, fromPath, toPath: join(path, filename),
      });

      return;
    }

    await Promise.allSettled(operation.selected.map(async (x) => {
      return await copyOrMoveMutation.mutateAsync({
        op: operation.op,
        clusterId: cluster.id,
        fromPath: join(operation.originalPath, x.name),
        toPath: join(path, x.name),
      }).then(() => {
        setOperation((o) => o ? { ...operation, completed: o.completed.concat(x) } : undefined);
        return x;
      }).catch(() => {
        return undefined;
      });
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
      }).catch((e) => {
        console.log(e);
        message.error(`执行${operationText}操作时遇到错误`);
      }).finally(() => {
        resetSelectedAndOperation();
        reload();
      });

  };

  const deleteMutation = trpc.file.deleteItem.useMutation();

  const onDeleteClick = () => {
    const files = keysToFiles(selectedKeys);
    modal.confirm({
      title: "确认删除",
      content: `确认要删除选中的${files.length}项？`,
      onOk: async () => {
        await Promise.allSettled(files.map(async (x: FileInfo) => {
          return deleteMutation.mutateAsync({
            target: x.type,
            clusterId: cluster.id,
            path: join(path, x.name),
          }).then(() => x).catch(() => undefined);
        }))
          .then((successfulInfo) => {
            const failedCount = successfulInfo.filter((x: PromiseSettledResult) =>
              (!x || x.status === "rejected" || !x.value)).length;
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
    return filesQuery.data?.filter((x: FileInfo) => keys.includes(fileInfoKey(x, path))) ?? [];
  };

  const onHiddenClick = () => {
    setShowHiddenFile(!showHiddenFile);
  };

  return (
    <div>
      <TitleText>
        <span>
          集群{getI18nConfigCurrentText(cluster.name, undefined)}文件管理
        </span>
      </TitleText>
      <TopBar>
        <Button onClick={toHome} icon={<HomeOutlined />} shape="circle" />
        <Button onClick={up} icon={<UpOutlined />} shape="circle" />
        <PathBar
          path={path}
          loading={filesQuery.isFetching}
          onPathChange={(curPath) => {
            if (curPath === path) {
              reload();
            } else {
              router.push(fullUrl(curPath));
            }
          }}
          breadcrumbItemRender={(pathSegment, index, path) =>
            (index === 0 ? (
              <Link href={fullUrl("/")} title="/" onClick={(e) => e.stopPropagation()}>
                <DatabaseOutlined />
              </Link>
            ) : (
              <Link
                href={fullUrl(path)}
                key={index}
                onClick={(e) => e.stopPropagation()}
              >
                {pathSegment}
              </Link>
            ))
          }
        />
      </TopBar>
      <OperationBar>
        <Space wrap>
          <UploadButton
            clusterId={cluster.id}
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
              setOperation({
                op:"move",
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
          <Button
            onClick={onHiddenClick}
            icon={showHiddenFile ? <EyeInvisibleOutlined /> : <EyeOutlined />}
          >
            {showHiddenFile ? "不显示" : "显示"}隐藏的项目
          </Button>
          <Link
            href={`/shell/${cluster.id}/${loginNodeAddress}${path}`}
            target="_blank"
          >
            <Button icon={<MacCommandOutlined />}>
              在终端中打开
            </Button>
          </Link>
          <CreateFileButton
            cluster={cluster}
            path={path}
            reload={reload}
          >
            新文件
          </CreateFileButton>
          <MkdirButton
            clusterId={cluster.id}
            path={path}
            reload={() => reload()}
          >
            新目录
          </MkdirButton>
        </Space>
      </OperationBar>
      <FileTable
        files={filesQuery.data ?? []}
        filesFilter={(files) => files.filter((file) => showHiddenFile || !file.name.startsWith("."))}
        loading={filesQuery.isFetching}
        rowSelection={{
          selectedRowKeys: selectedKeys,
          onChange: setSelectedKeys,
        }}
        rowKey={(r) => fileInfoKey(r, path)}
        onRow={(r) => ({
          onClick: () => {
            setSelectedKeys([fileInfoKey(r, path)]);
          },
          onDoubleClick: () => {
            if (r.type === "DIR") {
              router.push(fullUrl(join(path, r.name)));
            } else if (r.type === "FILE") {
              const href = urlToDownload(cluster.id, join(path, r.name), false, publicConfig.BASE_PATH);
              openPreviewLink(href);
            }
          },
        })}
        fileNameRender={(_, r) => (
          r.type === "DIR" ? (
            <Link href={fullUrl(join(path, r.name))} passHref>
              {r.name}
            </Link>
          ) : (
            <a onClick={() => {
              const href = urlToDownload(cluster.id, join(path, r.name), false, publicConfig.BASE_PATH);
              openPreviewLink(href);
            }}
            >
              {r.name}
            </a>
          )
        )}
        actionRender={(_, i: FileInfo) => (
          <Space>
            {
              i.type === "FILE" ? (
                <a href={urlToDownload(cluster.id, join(path, i.name), true, publicConfig.BASE_PATH)}>
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
                onOk: () => {
                  deleteMutation.mutate({
                    target: i.type, clusterId: cluster.id, path: fullPath,
                  }, {
                    onSuccess: () => {
                      message.success("删除成功！");
                      resetSelectedAndOperation();
                      reload();
                    },
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
