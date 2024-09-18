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

import { ClusterOutlined } from "@ant-design/icons";
import { Space, Tooltip } from "antd";
import React from "react";
import { getCurrentLangLibWebText } from "src/utils/libWebI18n/libI18n";
import { useTheme } from "styled-components";

import { Cluster, SingleClusterSelector } from "../components/ClusterSelector";


export const ThemeClusterOutlined: React.FC = () => {
  const { token } = useTheme();

  return (
    <ClusterOutlined style={{ color: token.colorPrimary }} />
  );
};

interface Props {
  clusters: Cluster[];
  cluster: Cluster;
  setCluster: (cluster: Cluster) => void;
  languageId: string;
}

export const DefaultClusterSelector: React.FC<Props> = ({ clusters, cluster, setCluster, languageId }) => {

  return (
    <Space>
      <Tooltip title={getCurrentLangLibWebText(languageId, "defaultClusterSelectorTitle")}>
        <ThemeClusterOutlined />
      </Tooltip>
      <SingleClusterSelector
        clusters={clusters}
        value={cluster}
        languageId={languageId}
        onChange={(cluster) => {
          setCluster(cluster);
        }}
        label={getCurrentLangLibWebText(languageId, "defaultClusterSelectorLabel")}
      />
    </Space>
  );
};
