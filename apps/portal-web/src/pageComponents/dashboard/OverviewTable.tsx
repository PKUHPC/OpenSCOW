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

export interface ClusterInfo extends PartitionInfo {
  id: number;
  clusterName: I18nStringType | undefined;
  cpuUsage: string;
  gpuUsage?: string;
}

interface Props {
  clusterInfo: ClusterInfo[];
  failedClusters: ({clusterName: I18nStringType})[];
  isLoading: boolean;
}

interface InfoProps {
  id: number;
  partitionName: string;
  nodeCount: number;
  pendingJobCount: number;
  cpuUsage: string;
  gpuUsage?: string;
  usageRatePercentage: number;
  partitionStatus: PartitionInfo_PartitionStatus;
}

interface TableProps {
  clusterName: I18nStringType;
  info?: InfoProps
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
        dataSource={(clusterInfo.map((x) => ({ clusterName:x.clusterName, info:{ ...x } })) as Array<TableProps>)
          .concat(failedClusters)}
        loading={isLoading}
        pagination={false}
        scroll={{ y:275 }}
        rowClassName={(tableProps) => (tableProps.info?.id === selectId ? "rowBgColor" : "")}
        onRow={(r) => {
          return {
            onClick() {
              if (r.info?.id !== undefined) {
                setSelectId(r.info?.id);
              }
            },
          };
        }}
      >
        <Table.Column<TableProps>
          dataIndex="clusterName"
          width="15%"
          title={t(p("clusterName"))}
          sorter={(a, b, sortOrder) =>
            compareWithUndefined(getI18nConfigCurrentText(a.clusterName, languageId),
              getI18nConfigCurrentText(b.clusterName, languageId), sortOrder)}
          render={(clusterName) => getI18nConfigCurrentText(clusterName, languageId)}
        />
        <Table.Column<TableProps>
          dataIndex="partitionName"
          title={t(p("partitionName"))}
          sorter={(a, b, sortOrder) => compareWithUndefined(a.info?.partitionName, b.info?.partitionName, sortOrder)}
          render={(_, r) => r.info?.partitionName ?? "-"}
        />
        <Table.Column<TableProps>
          dataIndex="nodeCount"
          title={t(p("nodeCount"))}
          sorter={(a, b, sortOrder) => compareWithUndefined(a.info?.nodeCount, b.info?.nodeCount, sortOrder)}
          render={(_, r) => r.info?.nodeCount ?? "-"}
        />
        <Table.Column<TableProps>
          dataIndex="usageRatePercentage"
          title={t(p("usageRatePercentage"))}
          sorter={(a, b, sortOrder) =>
            compareWithUndefined(a.info?.usageRatePercentage, b.info?.usageRatePercentage, sortOrder)}
          render={(_, r) => r.info?.usageRatePercentage !== undefined ? r.info?.usageRatePercentage + "%" : "-"}
        />
        <Table.Column<TableProps>
          dataIndex="cpuUsage"
          title={t(p("cpuUsage"))}
          sorter={(a, b, sortOrder) => compareWithUndefined(a.info?.cpuUsage, b.info?.cpuUsage, sortOrder)}
          render={(_, r) => r.info?.cpuUsage !== undefined ? r.info?.cpuUsage + "%" : "-"}
        />
        <Table.Column<TableProps>
          dataIndex="gpuUsage"
          title={t(p("gpuUsage"))}
          sorter={(a, b, sortOrder) => compareWithUndefined(a.info?.gpuUsage, b.info?.gpuUsage, sortOrder) }
          render={(_, r) => r.info?.gpuUsage !== undefined ? r.info?.gpuUsage + "%" : "-" }
        />
        <Table.Column<TableProps>
          dataIndex="pendingJobCount"
          title={t(p("pendingJobCount"))}
          sorter={(a, b, sortOrder) =>
            compareWithUndefined(a.info?.pendingJobCount, b.info?.pendingJobCount, sortOrder)}
          render={(_, r) => r.info?.pendingJobCount ?? "-" }
        />
        <Table.Column<TableProps>
          dataIndex="partitionStatus"
          title={t(p("partitionStatus"))}
          sorter={(a, b, sortOrder) =>
            compareWithUndefined(a.info?.partitionStatus, b.info?.partitionStatus, sortOrder)}
          render={(_, r) => r.info?.partitionStatus === 0 ?
            <Tag color="red">{t(p("notAvailable"))}</Tag> : <Tag color="green">{t(p("available"))}</Tag>
          }
        />
      </Table>
      <InfoPanes selectItem={selectItem ?? {}} loading={isLoading} />
    </Container>

  );
};
