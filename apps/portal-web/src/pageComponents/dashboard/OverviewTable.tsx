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

import { I18nStringType } from "@scow/config/build/i18n";
import { getI18nConfigCurrentText } from "@scow/lib-web/build/utils/systemLanguage";
import { PartitionInfo, PartitionInfo_PartitionStatus } from "@scow/protos/build/portal/config";
import { Table, Tag } from "antd";
import React, { useMemo, useState } from "react";
import { prefix, useI18n, useI18nTranslateToString } from "src/i18n";
import { InfoPanes } from "src/pageComponents/dashboard/InfoPanes";
import { compareWithUndefined } from "src/utils/dashboard";
import { styled } from "styled-components";

interface Props {
  clusterInfo: ClusterInfo[];
  failedClusters: ({clusterName?: I18nStringType})[];
  isLoading: boolean;
}

export interface ClusterInfo extends PartitionInfo {
  id: number;
  clusterName?: I18nStringType;
}

interface TableProps {
  id?: number;
  clusterName?: I18nStringType;
  partitionName?: string;
  nodeCount?: number;
  pendingJobCount?: number;
  cpuUsage?: number;
  gpuUsage?: number;
  usageRatePercentage?: number;
  partitionStatus?: PartitionInfo_PartitionStatus;
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

export const OverviewTable: React.FC<Props> = ({ clusterInfo, failedClusters, isLoading }) => {

  const t = useI18nTranslateToString();
  const languageId = useI18n().currentLanguage.id;

  const [selectId, setSelectId] = useState(0);

  const selectItem = useMemo(() => clusterInfo[selectId], [clusterInfo, selectId]);

  return (
    <Container>
      <Table
        title={() => t(p("title"))}
        tableLayout="fixed"
        dataSource={(clusterInfo as Array<TableProps>).concat(failedClusters)}
        loading={isLoading}
        pagination={false}
        scroll={{ y:275 }}
        rowClassName={(_, index) => (index === selectId ? "rowBgColor" : "")}
        onRow={(r) => {
          return {
            onClick() {
              r.id && setSelectId(r.id);
            },
          };
        }}
      >
        <Table.Column<TableProps>
          dataIndex="clusterName"
          width="15%"
          title={t(p("clusterName"))}
          sorter={(a, b) =>
            compareWithUndefined(getI18nConfigCurrentText(a.clusterName, languageId),
              getI18nConfigCurrentText(b.clusterName, languageId))}
          render={(clusterName) => getI18nConfigCurrentText(clusterName, languageId)}
        />
        <Table.Column<TableProps>
          dataIndex="partitionName"
          title={t(p("partitionName"))}
          sorter={(a, b) => compareWithUndefined(a.partitionName, b.partitionName)}
          render={(partitionName) => partitionName ?? "-"}
        />
        <Table.Column<TableProps>
          dataIndex="nodeCount"
          title={t(p("nodeCount"))}
          sorter={(a, b) => compareWithUndefined(a.nodeCount, b.nodeCount)}
          render={(nodeCount) => nodeCount ?? "-"}
        />
        <Table.Column<TableProps>
          dataIndex="usageRatePercentage"
          title={t(p("usageRatePercentage"))}
          sorter={(a, b) => compareWithUndefined(a.usageRatePercentage, b.usageRatePercentage)}
          render={(usageRatePercentage) => usageRatePercentage !== undefined ? usageRatePercentage + "%" : "-"}
        />
        <Table.Column<TableProps>
          dataIndex="cpuUsage"
          title={t(p("cpuUsage"))}
          sorter={(a, b) => compareWithUndefined(a.cpuUsage, b.cpuUsage)}
          render={(cpuUsage) => cpuUsage !== undefined ? cpuUsage + "%" : "-"}
        />
        <Table.Column<TableProps>
          dataIndex="gpuUsage"
          title={t(p("gpuUsage"))}
          sorter={(a, b) => compareWithUndefined(a.gpuUsage, b.gpuUsage) }
          render={(gpuUsage) => gpuUsage !== undefined ? gpuUsage + "%" : "-" }
        />
        <Table.Column<TableProps>
          dataIndex="pendingJobCount"
          title={t(p("pendingJobCount"))}
          sorter={(a, b) => compareWithUndefined(a.pendingJobCount, b.pendingJobCount)}
          render={(pendingJobCount) => pendingJobCount ?? "-" }
        />
        <Table.Column<TableProps>
          dataIndex="partitionStatus"
          title={t(p("partitionStatus"))}
          sorter={(a, b) => compareWithUndefined(a.partitionStatus, b.partitionStatus)}
          render={(partitionStatus) => partitionStatus === 0 ?
            <Tag color="red">{t(p("notAvailable"))}</Tag> : <Tag color="green">{t(p("available"))}</Tag>
          }
        />
      </Table>
      <InfoPanes selectItem={selectItem ?? {}} loading={isLoading} />
    </Container>

  );
};
