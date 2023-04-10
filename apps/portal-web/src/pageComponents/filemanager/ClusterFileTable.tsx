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

import { HomeOutlined, UpOutlined } from "@ant-design/icons";
import { compareDateTime, formatDateTime } from "@scow/lib-web/build/utils/datetime";
import { compareNumber } from "@scow/lib-web/build/utils/math";
import { Button, Table } from "antd";
import { join } from "path";
import React, { useEffect, useState } from "react";
import { api } from "src/apis";
import { SingleClusterSelector } from "src/components/ClusterSelector";
import { FileInfo } from "src/pages/api/file/list";
import { Cluster } from "src/utils/config";
import { FileInfoKey, fileInfoKey, fileTypeIcons, nodeModeToString, openPreviewLink, TopBar } from "src/utils/file";

import { urlToDownload } from "./api";
import { PathBar } from "./PathBar";

interface Props {
  selectedCluster: Cluster;
  setSelectedCluster: (cluster: Cluster) => void;
  path: string;
  setPath: (path: string) => void;
  selectedKeys: FileInfoKey[];
  setSelectedKeys: (keys: FileInfoKey[]) => void;
}

export const ClusterFileTable: React.FC<Props> = ({
  selectedCluster, setSelectedCluster, path, setPath, selectedKeys, setSelectedKeys,
}) => {

  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<FileInfo[]>([]);

  const reload = async () => {
    setLoading(true);
    selectedCluster ? (
      await api.listFile({ query: { cluster: selectedCluster.id, path: path! } })
        .then((d) => {
          setFiles(d.items);
        })
        .finally(() => {
          setLoading(false);
        })
    ) : (setLoading(false));
  };

  useEffect(() => {
    reload();
  }, [selectedCluster, path]);

  const up = () => {
    const paths = path!.split("/");
    const newPath = paths.length === 1 ? path : paths.slice(0, paths.length - 1).join("/");
    setPath(newPath);
  };

  const toHome = async () => {
    await api.getHomeDirectory({ query: { cluster: selectedCluster!.id } })
      .then((d) => {
        setPath(d.path);
      });
  };

  return (
    <>
      <SingleClusterSelector
        value={selectedCluster}
        onChange={async (cluster) => {
          await api.getHomeDirectory({ query: { cluster: cluster!.id } })
            .then((d) => {
              console.log(d);
              setPath(d.path);
              setSelectedCluster(cluster);
            });
        }}
      />
      <TopBar>
        <Button onClick={toHome} icon={<HomeOutlined />} shape="circle" />
        <Button onClick={up} icon={<UpOutlined />} shape="circle" />
        <PathBar
          path={path ? path : ""}
          reload={reload}
          loading={loading}
          go={(path) => setPath(path)}
          fullUrl={() => "files/fileTransfer"}
        />
      </TopBar>
      <Table
        dataSource={files}
        loading={loading}
        pagination={false}
        size="small"
        rowKey={(r) => fileInfoKey(r, path!)}
        scroll={{ x: true }}
        rowSelection={{
          selectedRowKeys: selectedKeys,
          onChange: (keys) => { setSelectedKeys(keys); },
        }}
        onRow={(r) => ({
          onClick: () => {
            setSelectedKeys([fileInfoKey(r, path!)]);
          },
          onDoubleClick: () => {
            if (r.type === "DIR") {
              setPath(join(path!, r.name));
              // reload();
            } else if (r.type === "FILE") {
              const href = urlToDownload(selectedCluster!.id, join(path!, r.name), false);
              openPreviewLink(href);
            }
          },
        })}
      >
        <Table.Column<FileInfo>
          dataIndex="type"
          title=""
          width={"32px"}
          defaultSortOrder={"ascend"}
          sorter={(a, b) => a.type.localeCompare(b.type)}
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
            r.type === "DIR" ? (
              <a onClick={() => {
                setPath(join(path!, r.name));
              }}
              >
                {r.name}
              </a>
            ) : (
              <a onClick={() => {
                const href = urlToDownload(selectedCluster!.id, join(path!, r.name), false);
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
          sorter={(a, b) => compareDateTime(a.mtime, b.mtime)}
        />

        <Table.Column<FileInfo>
          dataIndex="size"
          title="大小"
          render={(size: number | undefined) => size === undefined ? "" : Math.floor(size / 1024) + " KB"}
          sorter={(a, b) => compareNumber(a.size, b.size)}
        />

        <Table.Column<FileInfo>
          dataIndex="mode"
          title="权限"
          render={(mode: number | undefined) => mode === undefined ? "" : nodeModeToString(mode)}
        />

      </Table>
    </>
  );
};
