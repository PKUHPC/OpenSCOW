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
import { prefix, useI18nTranslateToString } from "src/i18n";
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

  .rowBgColor{
    background-color: ${({ theme }) => theme.token.colorBorder};
    /* 去除鼠标经过默认的背景颜色 */
    td {
      background: none !important;
  }
  }

`;
const p = prefix("pageComp.dashboard.overviewTable.");

export const OverviewTable: React.FC<Props> = ({ clusterInfo, isLoading }) => {

  const t = useI18nTranslateToString();

  const [selectId, setSelectId] = useState(0);

  const selectItem = useMemo(() => clusterInfo[selectId], [clusterInfo, selectId]);
  return (
    <Container>
      <Table
        title={() => t(p("title"))}
        tableLayout="fixed"
        dataSource={clusterInfo as Array<TableProps>}
        loading={isLoading}
        pagination={false}
        scroll={{ y:275 }}
        rowClassName={(_, index) => (index === selectId ? "rowBgColor" : "")}
        onRow={(r) => {
          return {
            onClick() {
              setSelectId(r.id);
            },
          };
        }}
      >
        <Table.Column dataIndex="clusterName" width="15%" title={t(p("clusterName"))} />
        <Table.Column dataIndex="partitionName" title={t(p("partitionName"))} />
        <Table.Column dataIndex="nodeCount" title={t(p("nodeCount"))} />
        <Table.Column dataIndex="runningNodeCount" title={t(p("runningNodeCount"))} />
        <Table.Column dataIndex="cpuCoreCount" title={t(p("cpuCoreCount"))} />
        <Table.Column dataIndex="gpuCoreCount" title={t(p("gpuCoreCount"))} />
        <Table.Column
          dataIndex="usageRatePercentage"
          title={t(p("usageRatePercentage"))}
          render={(usageRatePercentage) => usageRatePercentage + "%"}
        />
        <Table.Column
          dataIndex="partitionStatus"
          title={t(p("partitionStatus"))}
          render={(partitionStatus) => partitionStatus === 1 ?
            <Tag color="green">{t(p("available"))}</Tag> : <Tag color="red">{t(p("notAvailable"))}</Tag>
          }
        />
      </Table>
      <InfoPanes selectItem={selectItem ?? {}} loading={isLoading} />
    </Container>

  );
};
