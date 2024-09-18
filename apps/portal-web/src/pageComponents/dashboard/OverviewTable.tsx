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

import { blue,gray } from "@ant-design/colors";
import { I18nStringType } from "@scow/config/build/i18n";
import { getI18nConfigCurrentText } from "@scow/lib-web/build/utils/systemLanguage";
import { PartitionInfo, PartitionInfo_PartitionStatus } from "@scow/protos/build/portal/config";
import { Table, Tag } from "antd";
import React, { useEffect, useMemo, useState } from "react";
import { Localized, prefix, useI18n, useI18nTranslateToString } from "src/i18n";
import { ClusterOverview, PlatformOverview } from "src/models/cluster";
import { InfoPanes } from "src/pageComponents/dashboard/InfoPanes";
import { Cluster } from "src/utils/cluster";
import { compareWithUndefined } from "src/utils/dashboard";
import { styled } from "styled-components";

import { CustomProgress } from "./CustomProgress";
import { DashboardSection } from "./DashboardSection";

export interface ClusterInfo extends PartitionInfo {
  id: number;
  clusterName: I18nStringType | undefined;
  cpuUsage: string;
  gpuUsage?: string;
}

interface Props {
  clusterInfo: ClusterInfo[];
  failedClusters: ({ clusterName: I18nStringType })[];
  currentClusters: Cluster[];
  isLoading: boolean;
  clustersOverview: ClusterOverview[];
  platformOverview?: PlatformOverview | undefined;
  successfulClusters?: Cluster[] | undefined
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

  .ant-table-title {
    padding-left: 24px !important;
    display: flex;
    align-items: center;
    justify-content: start;
    font-size: 16px;
    font-weight: 600;
  }

  .rowBgColor{
    /* 去除鼠标经过默认的背景颜色 */
    td {
      background: none !important;
    }
  }
`;

const p = prefix("pageComp.dashboard.overviewTable.");

export const OverviewTable: React.FC<Props> = ({ clusterInfo, failedClusters,
  currentClusters, isLoading, clustersOverview, platformOverview, successfulClusters }) => {
  const t = useI18nTranslateToString();
  const languageId = useI18n().currentLanguage.id;

  const [selectId, setSelectId] = useState<number | undefined>(undefined);

  const selectItem = useMemo(() => clusterInfo[selectId ?? 0], [clusterInfo, selectId]);

  // 控制Tab切换
  const [activeTabKey, setActiveTabKey] = useState("platformOverview");

  // 找到对应平台概览
  const selectedClusterOverview = useMemo(() => {
    if (!selectItem?.clusterName) {
      return undefined;
    };
    return clustersOverview.find(
      (overview) =>
        overview.clusterName === selectItem.clusterName,
    );
  }, [selectItem, clustersOverview, languageId]);

  // 当activekey改变时表格数据显示的逻辑
  const filteredClusterInfo = useMemo(() => {
    if (activeTabKey === "platformOverview") {
      setSelectId(undefined);
      return clustersOverview;
    }
    return clusterInfo.filter((info) => info.clusterName === activeTabKey);
  }, [activeTabKey, clusterInfo, languageId]);

  useEffect(() => {
    if (activeTabKey !== "platformOverview") {
      const selectedInfo = clusterInfo.find((info) => info.clusterName === activeTabKey);
      if (selectedInfo) {
        setSelectId(selectedInfo.id);
      }
    }
  }, [activeTabKey, clusterInfo]);

  const dataSource = (filteredClusterInfo.map((x, index) =>
    ({ clusterName: x.clusterName, info: { ...x, id: index, cpuUsage: (x.runningCpuCount / x.cpuCoreCount) * 100,
      gpuUsage: x.gpuCoreCount === 0 ? undefined
        : (x.runningGpuCount / x.gpuCoreCount) * 100 } })) as TableProps[]);

  const finalDataSource = activeTabKey === "platformOverview" ? dataSource.concat(failedClusters) : dataSource;

  return (
    (isLoading || currentClusters.length > 0) ? (
      <Container>
        <InfoPanes
          selectItem={selectId == undefined ? platformOverview : selectedClusterOverview}
          loading={isLoading}
          activeTabKey={activeTabKey}
          onTabChange={setActiveTabKey}
          successfulClusters={successfulClusters}
        />
        <Table
          style={{
            marginTop:"15px",
          }}
          tableLayout="fixed"
          dataSource={finalDataSource}
          loading={isLoading}
          pagination={false}
          scroll={{ y:275 }}
          rowClassName={(tableProps) => (tableProps.info?.id === selectId ? "rowBgColor" : "")}
          onRow={(r) => {
            return {
              onClick() {
                if (r.info?.id !== undefined) {
                  setSelectId(r.info?.id);
                  setActiveTabKey(getI18nConfigCurrentText(r.clusterName, languageId));
                }
              },
            };
          }}
        >
          <Table.Column<TableProps>
            dataIndex="clusterName"
            width="15%"
            title={t(p("clusterName"))}
            hidden={activeTabKey !== "platformOverview"}
            sorter={(a, b, sortOrder) =>
              compareWithUndefined(getI18nConfigCurrentText(a.clusterName, languageId),
                getI18nConfigCurrentText(b.clusterName, languageId), sortOrder)}
            render={(clusterName) => (
              <span style={{ fontWeight:700 }}>
                {getI18nConfigCurrentText(currentClusters.find((cluster) => cluster.id == clusterName)?.name
                ?? clusterName, languageId)}
              </span>
            )}
          />
          <Table.Column<TableProps>
            dataIndex="partitionName"
            title={t(p("partitionName"))}
            hidden={activeTabKey === "platformOverview"}
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
            hidden={clusterInfo.every((item) => item.usageRatePercentage === undefined)}
            render={(_, r) => (
              (r.info?.usageRatePercentage !== undefined && !isNaN(r.info.usageRatePercentage)) ? (
                (
                  <div>
                    <CustomProgress
                      percent={Math.min(Number(r.info?.usageRatePercentage.toFixed(2) ?? 0), 100)}
                      width="120px"
                      height="15px"
                      bgColor={gray[0]}
                      progressColor={blue[5]}
                    />
                  </div>
                )
              ) : "-"
            )}
          />
          <Table.Column<TableProps>
            dataIndex="cpuUsage"
            title={t(p("cpuUsage"))}
            sorter={(a, b, sortOrder) => compareWithUndefined(a.info?.cpuUsage, b.info?.cpuUsage, sortOrder)}
            render={(_, r) => (
              r.info?.cpuUsage !== undefined ? (
                <div>
                  <CustomProgress
                    percent={Math.min(Number(Number(r.info?.cpuUsage ?? 0).toFixed(2)), 100)}
                    width="120px"
                    height="15px"
                    bgColor={gray[0]}
                    progressColor={blue[5]}
                  />
                </div>
              ) : "-"
            )}
          />
          <Table.Column<TableProps>
            dataIndex="gpuUsage"
            title={t(p("gpuUsage"))}
            sorter={(a, b, sortOrder) => compareWithUndefined(a.info?.gpuUsage, b.info?.gpuUsage, sortOrder) }
            render={(_, r) => (
              r.info?.gpuUsage !== undefined ? (
                <div>
                  <CustomProgress
                    percent={Math.min(Number(Number(r.info.gpuUsage).toFixed(2)), 100)}
                    width="120px"
                    height="15px"
                    bgColor={gray[0]}
                    progressColor={blue[5]}
                  />
                </div>
              ) : "-"
            )}
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
            hidden={activeTabKey === "platformOverview"}
            sorter={(a, b, sortOrder) =>
              compareWithUndefined(a.info?.partitionStatus, b.info?.partitionStatus, sortOrder)}
            render={(_, r) => r.info?.partitionStatus === 0 ?
              <Tag color="red">{t(p("notAvailable"))}</Tag> : <Tag color="green">{t(p("available"))}</Tag>
            }
          />
        </Table>
      </Container>

    ) : (
      <DashboardSection
        style={{ marginBottom: "16px" }}
        title={<Localized id={"pageComp.dashboard.overviewTable.title"} />}
      >
        {t("pages.common.noAvailableClusters")}
      </DashboardSection>
    )
  );
};
