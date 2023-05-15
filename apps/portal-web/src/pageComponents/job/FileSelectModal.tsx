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
import { Button, Modal } from "antd";
import Link from "next/link";
import { join } from "path";
import React, { Key, useCallback, useRef, useState } from "react";
import { useAsync } from "react-async";
import { api } from "src/apis";
import { FilterFormContainer } from "src/components/FilterFormContainer";
import { ModalButton } from "src/components/ModalLink";
import { FileTable } from "src/pageComponents/filemanager/FileTable";
import { MkdirModal } from "src/pageComponents/filemanager/MkdirModal";
import { PathBar } from "src/pageComponents/filemanager/PathBar";
import { FileInfo } from "src/pages/api/file/list";
import { Cluster } from "src/utils/config";
import styled from "styled-components";


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
  cluster: Cluster,
  onSubmit: (path: string) => void;
}

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


export const FileSelectModal: React.FC<Props> = ({ cluster, onSubmit }) => {

  const [visible, setVisible] = useState(false);
  const [path, setPath] = useState<string>("/");
  const [selectedKeys, setSelectedKeys] = useState<Key[]>([]);


  const prevPathRef = useRef<string>(path);


  const fileFilter = (files: FileInfo[]): FileInfo[] => {
    return files.filter(
      (file) => file.type === "DIR" && !file.name.startsWith("."));
  };

  const { data: homePath, isLoading: isHomePathLoading } = useAsync({
    promiseFn: useCallback(async () => cluster
      ? api.getHomeDirectory({ query: { cluster: cluster.id } }) : { path: "" }, [cluster.id]),
  });


  const listFilePromiseFn = useCallback(async () => {
    return visible && homePath
      ? await api.listFile({ query: { cluster: cluster.id, path: join(homePath.path, path) } })
      : { items: []};
  }, [path, cluster, visible, homePath]);

  const { data, isLoading: isFileLoading, reload } = useAsync({
    promiseFn: listFilePromiseFn,
    onResolve(_) {
      prevPathRef.current = path;
    },
    onReject(_) {
      if (prevPathRef.current !== path) {
        setPath(prevPathRef.current);
      }
    },
  });

  const closeModal = () => {
    setVisible(false);
    setPath("/");
    setSelectedKeys([]);
  };

  const onOkClick = () => {
    const submitPath = selectedKeys.length > 0 ? selectedKeys[0].toString() : path;
    // 将/xxx/xx都转为xxx/xx传参
    onSubmit(submitPath.startsWith("/") ? submitPath.slice(1) : submitPath);
    closeModal();
  };

  const onClickLink = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, clickPath: string) => {
    e.preventDefault();
    e.stopPropagation();
    setPath(clickPath);
    setSelectedKeys([]);
  };

  const isLoading = isHomePathLoading || isFileLoading;

  return (
    <>
      <Button size="small" onClick={() => { setVisible(true); }}>选择</Button>
      <Modal
        width={600}
        open={visible}
        onCancel={() => { closeModal(); }}
        title="文件目录选择框"
        footer={[
          <MkdirButton
            key="new"
            cluster={cluster.id}
            path={join(homePath?.path || "/", path)}
            reload={reload}
          >
            新目录
          </MkdirButton>,
          <Button key="cancel" onClick={() => { closeModal(); }}>取消</Button>,
          <Button key="ok" type="primary" onClick={onOkClick}>确定</Button>,
        ]}
      >
        <ModalContainer>
          <TopBar>
            <PathBar
              path={formatPath(path)}
              loading={isLoading}
              prefix="~"
              onPathChange={(curPath) => {
                curPath === path ? reload() : setPath(curPath);
              }}
              breadcrumbItemRender={(segment, index, curPath) =>
                index === 0
                  ? (
                    <Link
                      href=""
                      onClick={(e) => onClickLink(e, "/")}
                    ><DatabaseOutlined /> ~ </Link>
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
          <FileTable
            style={{ width: "100%" }}
            files={data?.items || []}
            filesFilter={fileFilter}
            hiddenColumns={["size", "mode"]}
            loading={isLoading}
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
          />
        </ModalContainer>
      </Modal>
    </>
  );
};

const MkdirButton = ModalButton(MkdirModal, { icon: <FolderAddOutlined /> });
