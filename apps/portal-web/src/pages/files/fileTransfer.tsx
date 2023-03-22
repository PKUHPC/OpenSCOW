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
import { Button, Col, Modal, Row } from "antd";
import { NextPage } from "next";
import { useState } from "react";
import { api } from "src/apis";
import { requireAuth } from "src/auth/requireAuth";
import { ClusterFileTable } from "src/pageComponents/filemanager/ClusterFileTable";
import { ProcessTable } from "src/pageComponents/filemanager/ProcessTable";
import { Cluster } from "src/utils/config";
type FileInfoKey = React.Key;
interface ButtonProps {
  icon: React.ReactNode;
  disabled: boolean;
  srcCluster: Cluster;
  dstCluster: Cluster;
  selectedKeys: FileInfoKey[];
  toPath: string;
}
interface TransferInfo {
  transferId: number;
  processId: number;
}
const OperationButton: React.FC<ButtonProps> = (props) => {
  const {
    icon,
    disabled,
    srcCluster,
    dstCluster,
    selectedKeys,
    toPath,
  } = props;
  const [transferInfos, setTransferInfos] = useState<TransferInfo[]>([]);
  const [showModal, setShowModal] = useState(false);
  const handleProcessStart = async () => {
    const newTransferInfos: TransferInfo[] = [];
    for (const key of selectedKeys) {
      const resp = await api.startTransferFiles({
        body: {
          fromCluster: srcCluster.id,
          toCluster: dstCluster.id,
          fromPath: String(key),
          toPath: toPath,
        },
      });
      newTransferInfos.push({ transferId: resp.transferId, processId: resp.processId });
    }
    setTransferInfos(newTransferInfos);
    setShowModal(true);
  };
  const handleModalClose = () => {
    setShowModal(false);
  };
  return (
    <>
      <Button icon={icon} disabled={disabled} onClick={handleProcessStart} />
      {showModal && (
        <Modal visible={showModal} onCancel={handleModalClose} footer={null}>
          {transferInfos.map((info) => (
            <ProcessTable
              key={`${info.transferId}-${info.processId}`}
              transferId={info.transferId}
              processId={info.processId}
              cluster={srcCluster.id}
            />
          ))}
        </Modal>
      )}
    </>
  );
};
export const FileTransferPage: NextPage = requireAuth(() => true)(() => {
  const [clusterLeft, setClusterLeft] = useState<Cluster>();
  const [clusterRight, setClusterRight] = useState<Cluster>();
  const [pathLeft, setPathLeft] = useState<string>();
  const [pathRight, setPathRight] = useState<string>();
  const [selectedKeysLeft, setSelectedKeysLeft] = useState<FileInfoKey[]>([]);
  const [selectedKeysRight, setSelectedKeysRight] = useState<FileInfoKey[]>([]);
  return (
    <>
      <Row justify="space-around" align="middle">
        <Col span={11}>
          <ClusterFileTable
            selectedCluster={clusterLeft!}
            setSelectedCluster={setClusterLeft}
            path={pathLeft!}
            setPath={setPathLeft}
            selectedKeys={selectedKeysLeft}
            setSelectedKeys={setSelectedKeysLeft}
          />
        </Col>
        <Col span={0.5}>
          <Row justify="center">
            <OperationButton
              icon={<ArrowRightOutlined />}
              disabled={!selectedKeysLeft || selectedKeysLeft.length === 0}
              srcCluster={clusterLeft!}
              dstCluster={clusterRight!}
              selectedKeys={selectedKeysLeft}
              toPath={pathRight!}
            />
          </Row>
          <Row justify="center">
            <OperationButton
              icon={<ArrowLeftOutlined />}
              disabled={!selectedKeysRight || selectedKeysRight.length === 0}
              srcCluster={clusterRight!}
              dstCluster={clusterLeft!}
              selectedKeys={selectedKeysRight}
              toPath={pathLeft!}
            />
          </Row>
        </Col>
        <Col span={11}>
          <ClusterFileTable
            selectedCluster={clusterRight!}
            setSelectedCluster={setClusterRight}
            path={pathRight!}
            setPath={setPathRight}
            selectedKeys={selectedKeysRight}
            setSelectedKeys={setSelectedKeysRight}
          />
        </Col>
      </Row>
    </>
  );
});
export default FileTransferPage;
