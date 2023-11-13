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

import { Table, Tag } from "antd";
import React, { useMemo, useState } from "react";
import { InfoPanes } from "src/pageComponents/dashboard/InfoPanes";
import { styled } from "styled-components";

interface Props {
  clusterInfo: ClusterInfo[];
}

export interface ClusterInfo {
  id: number;
  clusterName: string;
  partitionName: string;
  nodes: number;
  runningNodes: number;
  idleNodes: number;
  noAviailableNodes: number;
  cpuCores: number;
  runningCpus: number;
  idleCpus: number;
  noAviailableCpus: number;
  gpuCores: number;
  runningGpus: number;
  idleGpus: number;
  noAviailableGpus: number;
  jobNum: number;
  runningJob: number;
  pendingJob: number;
  usageRate: string;
  status: string;
}

interface TableProps {
  id: number;
  clusterName: string;
  partitionName: string;
  nodes: number;
  runningNodes: number;
  cpuCores: number;
  gpuCores: number;
  usageRate: string;
  status: string;
}
const Container = styled.div`
`;

export const OveriewTable: React.FC<Props> = ({ clusterInfo }) => {

  const [selectId, setSelectId] = useState(0);

  const selectItem = useMemo(() => clusterInfo[selectId], [clusterInfo, selectId]);
  return (
    <Container>
      <Table
        tableLayout="fixed"
        dataSource={clusterInfo as Array<TableProps>}
        // loading={isLoading}
        pagination={false}
        scroll={{ y:275 }}
        onRow={(r) => {
          return {
            onClick() {
              setSelectId(r.id);
            },
          };
        }}
      >
        <Table.Column dataIndex="clusterName" width="15%" title="集群" />
        <Table.Column dataIndex="partitionName" title="分区" />
        <Table.Column dataIndex="nodes" title="节点总数" />
        <Table.Column dataIndex="runningNodes" title="运行中节点数" />
        <Table.Column dataIndex="cpuCores" title="CPU核心数" />
        <Table.Column dataIndex="gpuCores" title="GPU卡数" />
        <Table.Column dataIndex="usageRate" title="节点使用率" />
        <Table.Column
          dataIndex="status"
          title="分区状态"
          render={(status) => {
            return status === "不可用" ?
              <Tag color="red">不可用</Tag> :
              <Tag color="green">可用</Tag>; }
          }
        />
      </Table>
      <InfoPanes selectItem={selectItem} />

    </Container>

  );
};
