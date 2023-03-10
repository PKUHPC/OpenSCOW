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
import { Button, Col, Row } from "antd";
import { NextPage } from "next";
import { useState } from "react";
import { api } from "src/apis";
import { requireAuth } from "src/auth/requireAuth";
import { ClusterFileTable } from "src/pageComponents/filemanager/ClusterFileTable";
import { Cluster } from "src/utils/config";

type FileInfoKey = React.Key;

export const FileTransferPage: NextPage = requireAuth(() => true)(() => {


  const [clusterLeft, setClusterLeft] = useState<Cluster>();
  const [clusterRight, setClusterRight] = useState<Cluster>();

  const [pathLeft, setPathLeft] = useState<string>();
  const [pathRight, setPathRight] = useState<string>();

  const [selectedKeysLeft, setSelectedKeysLeft] = useState<FileInfoKey[]>();
  const [selectedKeysRight, setSelectedKeysRight] = useState<FileInfoKey[]>();



  return (
    <>
      <Row justify="space-around" align="middle">
        <Col span={11}>
          <ClusterFileTable
            selectedCluster={ clusterLeft! }
            setSelectedCluster={ setClusterLeft }
            path={ pathLeft! }
            setPath={ setPathLeft }
            selectedKeys={ selectedKeysLeft! }
            setSelectedKeys={ setSelectedKeysLeft }
          />
        </Col>

        <Col span={0.5}>

          <Row justify="center">
            <Button
              icon={<ArrowRightOutlined />}
              disabled={ !selectedKeysLeft || selectedKeysLeft!.length === 0}
              onClick={ () => {
                selectedKeysLeft!.forEach(async (key) => {
                  await api.transferFiles({ body: {
                    srcCluster: clusterLeft!.id,
                    dstCluster: clusterRight!.id,
                    fromPath: String(key),
                    toPath: pathRight!,
                    maxDepth: 2,
                    port: 22222,
                    sshKeyPath: "~/.ssh/id_rsa",
                  } });
                });
              }}
            >
              复制
            </Button>
          </Row>

          <Row justify="center">
            <Button
              icon={<ArrowLeftOutlined />}
              disabled={ !selectedKeysRight || selectedKeysRight!.length === 0 }
              onClick={ () => {
                selectedKeysRight!.forEach(async (key) => {
                  await api.transferFiles({ body: {
                    srcCluster: clusterRight!.id,
                    dstCluster: clusterLeft!.id,
                    fromPath: String(key),
                    toPath: pathLeft!,
                    maxDepth: 2,
                    port: 22222,
                    sshKeyPath: "~/.ssh/id_rsa",
                  } });
                });
              } }
            >
              复制
            </Button>
          </Row>


          <Row justify="center">
            <Button
              icon={<ArrowRightOutlined />}
              disabled={ !selectedKeysLeft || selectedKeysLeft!.length === 0}
            >
              移动
            </Button>
          </Row>

          <Row justify="center">
            <Button
              icon={<ArrowLeftOutlined />}
              disabled={ !selectedKeysRight || selectedKeysRight!.length === 0 }
            >
              移动
            </Button>
          </Row>

        </Col>
        <Col span={11}>
          <ClusterFileTable
            selectedCluster={ clusterRight! }
            setSelectedCluster={ setClusterRight }
            path={ pathRight! }
            setPath={ setPathRight }
            selectedKeys={ selectedKeysRight! }
            setSelectedKeys={ setSelectedKeysRight }
          />
        </Col>

      </Row>
    </>
  );
});

export default FileTransferPage;
