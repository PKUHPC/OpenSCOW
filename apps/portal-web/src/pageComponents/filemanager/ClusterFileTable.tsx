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
import { Button } from "antd";
import { useState } from "react";
import { api } from "src/apis/api";
import { SingleClusterSelector } from "src/components/ClusterSelector";
import { FilterFormContainer } from "src/components/FilterFormContainer";
import { FileInfo } from "src/pages/api/file/list";
import { Cluster } from "src/utils/config";
import styled from "styled-components";

import { PathBar } from "./PathBar";

interface Props {
  cluster: Cluster;
  homePath: string;
}

const TopBar = styled(FilterFormContainer)`
  display: flex;
  flex-direction: row;
  padding-bottom: 8px;

  &>button {
    margin: 0px 4px;
  }
`;


export const ClusterFileTable: React.FC<Props> = ({ cluster, homePath }) => {

  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [path, setPath] = useState<string>(homePath);
  const [selectCluster, setSelectCluster] = useState<Cluster>();

  const reload = async (signal?: AbortSignal) => {
    setLoading(true);
    await api.listFile({ query: { cluster: cluster.id, path } }, signal)
      .then((d) => {
        setFiles(d.items);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const up = () => {
    const paths = path.split("/");
    const newPath = paths.length === 1 ? path : paths.slice(0, paths.length - 1).join("/");
    setPath(newPath);
    reload();
  };

  const toHome = () => {
    setPath("~");
    reload();
  };


  return (
    <>
      <SingleClusterSelector
        value={selectCluster}
        onChange={(cluster) => {
          setSelectCluster(cluster);
          setPath(homePath);
          reload();
        }}
      />
      <TopBar>
        <Button onClick={toHome} icon={<HomeOutlined />} shape="circle" />
        <Button onClick={up} icon={<UpOutlined />} shape="circle" />
        <PathBar
          path={path}
          reload={reload}
          loading={loading}
          go={(path) => setPath(path)}
          fullUrl={() => "files/fileTransfer"}
        />
      </TopBar>
    </>


  );
};

