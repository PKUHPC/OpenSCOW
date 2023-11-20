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

import { PartitionInfo, PartitionInfo_PartitionStatus } from "@scow/protos/build/portal/config";
import { Table, Tag } from "antd";
import React, { useMemo, useState } from "react";
import { InfoPanes } from "src/pageComponents/dashboard/InfoPanes";
import { styled } from "styled-components";

interface Props {
  clusterInfo: ClusterInfo[];
  isLoading: boolean;
}

export interface ClusterInfo extends PartitionInfo {
  id: number;
  clusterName: string;
}

interface TableProps {
  id: number;
  clusterName: string;
  partitionName: string;
  nodeCount: number;
  runningNodeCount: number;
  cpuCoreCount: number;
  gpuCoreCount: number;
  usageRatePercentage: number;
  partitionStatus: PartitionInfo_PartitionStatus;
}
const Container = styled.div`
  /* 修改滚动条样式 */
  .ant-table-body{
    &::-webkit-scrollbar {
    width: 5px !important;
    overflow-y: auto !important;
    }
    &::-webkit-scrollbar-thumb {
    border-radius: 5px !important;
    background: #ccc !important;
    }
    &::-webkit-scrollbar-track {
    -webkit-box-shadow: 0 !important;
    border-radius: 0 !important;
    background: #fff !important;
    }
  }
`;

export const OverviewTable: React.FC<Props> = ({ clusterInfo, isLoading }) => {

  const [selectId, setSelectId] = useState(0);

  const selectItem = useMemo(() => clusterInfo[selectId], [clusterInfo, selectId]);
  return (
    <Container>
      <Table
        tableLayout="fixed"
        dataSource={clusterInfo as Array<TableProps>}
        loading={isLoading}
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
        <Table.Column dataIndex="nodeCount" title="节点总数" />
        <Table.Column dataIndex="runningNodeCount" title="运行中节点数" />
        <Table.Column dataIndex="cpuCoreCount" title="CPU核心数" />
        <Table.Column dataIndex="gpuCoreCount" title="GPU卡数" />
        <Table.Column dataIndex="usageRatePercentage" title="节点使用率" />
        <Table.Column
          dataIndex="partitionStatus"
          title="分区状态"
          render={(partitionStatus) => {
            console.log(partitionStatus);
            return partitionStatus === 0 ?
              <Tag color="red">不可用</Tag> :
              <Tag color="green">可用</Tag>; }
          }
        />
      </Table>
      <InfoPanes selectItem={selectItem ?? {}} loading={isLoading} />
    </Container>

  );
};
