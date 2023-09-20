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

import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { App, Button, Col, Row } from "antd";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import { api } from "src/apis";
import { requireAuth } from "src/auth/requireAuth";
import { PageTitle } from "src/components/PageTitle";
import { ClusterFileTable } from "src/pageComponents/filemanager/ClusterFileTable";
import { Cluster, publicConfig } from "src/utils/config";
import { redirectToDashboard } from "src/utils/file";

type FileInfoKey = React.Key;

interface ButtonProps {
  icon: React.ReactNode;
  disabled: boolean;
  srcCluster: Cluster | undefined;
  dstCluster: Cluster | undefined;
  selectedKeys: FileInfoKey[];
  toPath: string;
}

const OperationButton: React.FC<ButtonProps> = (props) => {
  const { message, modal } = App.useApp();
  const {
    icon, disabled, srcCluster, dstCluster, selectedKeys, toPath,
  } = props;
  return (
    <Button
      icon={icon}
      disabled={disabled}
      onClick={ async () => {
        if (srcCluster && dstCluster) {
          modal.confirm({
            title: "确认开启传输?",
            content: `确认从${srcCluster.name}传输到${dstCluster.name}吗?`,
            okText: "确认",
            onOk: async () => {
              await api.checkTransferKey({ body: { fromCluster:srcCluster.id, toCluster: dstCluster.id } });
              Promise.all(selectedKeys.map(async (key) => {
                await api.startFilesTransfer({ body: {
                  fromCluster: srcCluster.id,
                  toCluster: dstCluster.id,
                  fromPath: String(key),
                  toPath: toPath,
                } })
                  .then(() => {
                    message.success("传输任务已经开始");
                  });
              }));
            },
          });

        }
      }}
    />

  );
};

export const FileTransferPage: NextPage = requireAuth(() => true)(() => {

  const router = useRouter();
  if (!publicConfig.CROSS_CLUSTER_FILE_TRANSFER_ENABLED) {
    redirectToDashboard(router);
  }

  const [clusterLeft, setClusterLeft] = useState<Cluster>();
  const [clusterRight, setClusterRight] = useState<Cluster>();

  const [pathLeft, setPathLeft] = useState<string>("");
  const [pathRight, setPathRight] = useState<string>("");

  const [selectedKeysLeft, setSelectedKeysLeft] = useState<FileInfoKey[]>([]);
  const [selectedKeysRight, setSelectedKeysRight] = useState<FileInfoKey[]>([]);



  return (
    <>
      <PageTitle titleText={"跨集群文件传输"} />
      <Row justify="space-around" align="middle">
        <Col span={11}>
          <ClusterFileTable
            selectedCluster={ clusterLeft }
            setSelectedCluster={ setClusterLeft }
            path={ pathLeft }
            setPath={ setPathLeft }
            selectedKeys={ selectedKeysLeft }
            setSelectedKeys={ setSelectedKeysLeft }
          />
        </Col>

        <Col span={0.5}>

          <Row justify="center">
            <OperationButton
              icon={<ArrowRightOutlined />}
              disabled={!selectedKeysLeft || selectedKeysLeft.length === 0}
              srcCluster={clusterLeft}
              dstCluster={clusterRight}
              selectedKeys={selectedKeysLeft}
              toPath={pathRight}
            />
          </Row>

          <Row justify="center">
            <OperationButton
              icon={<ArrowLeftOutlined />}
              disabled={!selectedKeysRight || selectedKeysRight.length === 0}
              srcCluster={clusterRight}
              dstCluster={clusterLeft}
              selectedKeys={selectedKeysRight}
              toPath={pathLeft}
            />
          </Row>

        </Col>

        <Col span={11}>
          <ClusterFileTable
            selectedCluster={ clusterRight }
            setSelectedCluster={ setClusterRight }
            path={ pathRight }
            setPath={ setPathRight }
            selectedKeys={ selectedKeysRight }
            setSelectedKeys={ setSelectedKeysRight }
          />
        </Col>

      </Row>
    </>
  );
});

export default FileTransferPage;
