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

import { DatabaseOutlined, FolderAddOutlined } from "@ant-design/icons";
import { Button, Modal, Space, Tree } from "antd";
import type { DataNode } from "antd/es/tree";
import Link from "next/link";
import { join } from "path";
import React, { Key, useCallback, useEffect, useRef, useState } from "react";
import { useAsync } from "react-async";
import { FilterFormContainer } from "src/components/FilterFormContainer";
import { ModalButton } from "src/components/ModalLink";
import { FileInfo } from "src/models/File";
import { Cluster } from "src/utils/config";
import { trpc } from "src/utils/trpc";
import { styled } from "styled-components";

import { FileTable } from "./FileTable";
import { MkdirModal } from "./mkdirModal";
import { PathBar } from "./PathBar";

const { DirectoryTree } = Tree;

const ModalContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const TopBar = styled(FilterFormContainer)`
  display: flex;
  flex-direction: row;
  padding-bottom: 8px;
  width: 100%;
  &>button {
    margin: 0px 4px;
  }
`;

interface Props {
  clusterId?: string,
  onSubmit: (path: string) => void;
}

interface DirContent {
  type: string;
  name: string;
  mtime: string;
  size: number;
  mode: number;
};

function convertToDirTree(data: DirContent[], targetKey: string): DataNode[] {

  const sortedData = data.sort((a, b) => {
    if (a.type === "DIR" && b.type !== "DIR") {
      return -1;
    } else if (a.type !== "DIR" && b.type === "DIR") {
      return 1;
    }
    return 0;
  });

  // 转换为 treeData 格式
  return sortedData.map((item) => ({
    title: item.name,
    key: join(targetKey, item.name),
    isLeaf: item.type === "FILE",
  }));
}

function updateTreeData(treeData: DataNode[], targetKey: string, newChildren: DirContent[]): DataNode[] {
  return treeData.map((node) => {
    // 如果找到了目标节点（即当前目录）
    if (node.key === targetKey) {
      // 将新内容转换为 DataNode[] 并设置为 children
      const childrenNodes = convertToDirTree(newChildren, targetKey);
      return { ...node, children: childrenNodes };
    }

    // 如果当前节点有子节点，递归地更新它们
    if (node.children) {
      return { ...node, children: updateTreeData(node.children, targetKey, newChildren) };
    }

    return node;
  });
};

// 处理path的特殊情况,比如为空或者不以"/"开头
const formatPath = (path: string) => {
  if (path === "") {
    return "/";
  }
  if (!path.startsWith("/")) {
    return "/" + path;
  }
  return path;
};


export const FileSelectModal: React.FC<Props> = ({ clusterId, onSubmit }) => {

  const [visible, setVisible] = useState(false);
  const [path, setPath] = useState<string>("~");
  const [selectedKeys, setSelectedKeys] = useState<Key[]>([]);
  const [dirTree, setDirTree] = useState<DataNode[]>([]);

  const prevPathRef = useRef<string>(path);

  trpc.file.getHomeDir.useQuery({ clusterId: clusterId ?? "" }, {
    enabled: !!clusterId && path === "~",
    onSuccess(data) {
      setPath(data.path);
    },
  });

  const { data: curDirContent, refetch, isLoading: isDirContentLoading } = trpc.file.listDirectory.useQuery({
    clusterId: clusterId ?? "",
    path,
  }, {
    enabled: !!clusterId,
  });

  useEffect(() => {
    if (visible) {
      refetch();
    }
  }, [visible]);

  useEffect(() => {
    if (!curDirContent) return;

    if (dirTree.length === 0) {
      setDirTree(convertToDirTree(curDirContent, path));
    } else {
      setDirTree(updateTreeData(dirTree, path, curDirContent));
    }
  }, [curDirContent]);

  const onLoadDir = async ({ key }: any) => {
    setPath(key);
  };

  const closeModal = () => {
    setVisible(false);
    setPath("/");
    setSelectedKeys([]);
  };

  const onOkClick = () => {
    const submitPath = selectedKeys.length > 0 ? selectedKeys[0].toString() : path;
    onSubmit(submitPath);
    closeModal();
  };

  const onClickLink = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, clickPath: string) => {
    e.preventDefault();
    e.stopPropagation();
    setPath(clickPath);
    setSelectedKeys([]);
  };

  // const isLoading = isFileLoading;

  // const t = useI18nTranslateToString();

  return (
    <>
      <Button size="small" onClick={() => { setVisible(true); }}><FolderAddOutlined /></Button>
      <Modal
        width={1000}
        open={visible}
        onCancel={() => { closeModal(); }}
        title="选择文件"
        footer={[
          <MkdirButton
            key="new"
            cluster={clusterId ?? ""}
            path={join("/", path)}
            //
            reload={() => {}}
          >
            新建文件夹
          </MkdirButton>,
          <Button key="cancel" onClick={() => { closeModal(); }}>取消</Button>,
          <Button key="ok" type="primary" onClick={onOkClick}>确认</Button>,
        ]}
      >
        <ModalContainer>
          <TopBar>
            <PathBar
              path={formatPath(path)}
              // loading={isLoading}
              loading={false}
              onPathChange={(curPath) => {
                // curPath === path ? reload() : setPath(join("/", curPath));
                curPath === path ? undefined : setPath(join("/", curPath));
              }}
              breadcrumbItemRender={(segment, index, curPath) =>
                index === 0
                  ? (
                    <Link
                      href=""
                      onClick={(e) => onClickLink(e, "/")}
                    ><DatabaseOutlined /></Link>
                  )
                  : (
                    <Link
                      href=""
                      onClick={(e) => onClickLink(e, curPath)}
                    >
                      {segment}
                    </Link>
                  )
              }
            />
          </TopBar>
          <Space style={{ alignItems: "flex-start" }}>
            <DirectoryTree
              style={{ width: 240, height: 541, overflow: "auto",
                border: "1px solid #e0e0e0", borderRadius: "5px" }}
              showLine
              loadData={onLoadDir}
              treeData={dirTree}
            />
            <div style={{ border: "1px solid #e0e0e0", borderRadius: "5px" }}>
              <FileTable
                files={curDirContent || []}
                loading={isDirContentLoading}
                fileNameRender={(fileName: string) => <Button type="link">{fileName}</Button>}
                hiddenColumns={["mtime", "mode", "action"]}
                pagination={false}
                rowKey={(r: FileInfo): React.Key => join(path, r.name)}
                onRow={(r) => ({
                  onClick: () => {
                    setSelectedKeys([join(path, r.name)]);
                  },
                  onDoubleClick: () => {
                    setPath(join(path, r.name));
                  },
                })}
                rowSelection={{
                  type: "radio",
                  selectedRowKeys: selectedKeys,
                  onChange: setSelectedKeys,
                }}
                scroll={{ x: true, y: 500 }}
              />
            </div>

          </Space>
        </ModalContainer>
      </Modal>
    </>
  );
};

const MkdirButton = ModalButton(MkdirModal, { icon: <FolderAddOutlined /> });
