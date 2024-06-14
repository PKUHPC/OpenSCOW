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

import React from "react";
import { DoubleInfoPane } from "src/pageComponents/dashboard/DoubleInfoPane";
import { InfoPane } from "src/pageComponents/dashboard/InfoPane";
import { styled } from "styled-components"; ;
import { Card, Col, Row } from "antd";
import { useStore } from "simstate";
import { prefix, useI18n, useI18nTranslateToString } from "src/i18n";
import { ClusterOverview, PlatformOverview } from "src/models/cluster";
import JobInfo from "src/pageComponents/dashboard/NodeRange";
import { ClusterInfoStore } from "src/stores/ClusterInfoStore";

interface Props {
  selectItem: ClusterOverview | PlatformOverview | undefined;
  loading: boolean;
  activeTabKey: string;
  onTabChange: (key: string) => void;
}

const InfoPaneContainer = styled.div`
  min-width: 350px;
`;
const DoubleInfoPaneContainer = styled.div`
  min-width: 700px;
  padding: 0 80px;
  /* 当该面板是第一个元素时不需要左右的padding */
  @media (max-width: 768px) {
  padding: 0;
  }
`;


const colors = {
  // 节点使用率颜色
  nodeUtilizationAvailable:"#6959CA",
  nodeUtilizationNotavailable:"#CFCAEE",
  nodeUtilizationStroke:"#E9E6F7",

  // CPU核心使用率颜色
  cpuAvailable:"#4DA2AE",
  cpunotAvailable:"#B0D6DC",
  cpuStroke:"#DBECEF",

  // GPU核心使用率颜色
  gpuAvailable:"#CDE044",
  gpunotAvailable:"#E1EC8F",
  gpuStroke:"#F5F9DA",

  // 作业字体颜色
  runningJob:"#D1CB5B",
  queuing:"#A58E74",
};
const p = prefix("pageComp.dashboard.infoPanes.");
export const InfoPanes: React.FC<Props> = ({ selectItem, loading, activeTabKey, onTabChange }) => {

  const t = useI18nTranslateToString();
  const languageId = useI18n().currentLanguage.id;

  const { currentClusters } = useStore(ClusterInfoStore);

  // card的每一项
  const clusterCardsList = [
    {
      key:"platformOverview",
      tab:
      <div style={{ width:"120px", height:"40px",
        textAlign: "center", lineHeight:"40px",
        color:`${activeTabKey === "platformOverview" ? "#FFF" : "#000"}`,
        background:`${activeTabKey === "platformOverview" ? "#9b0000" : "transparent"}`,
        borderRadius:"5px",
        fontWeight:"700",
      }}
      >
        {t(p("platformOverview"))}
      </div>,
    }, ...currentClusters.map((x) => ({
      key:x.id,
      tab:typeof (x.name) == "string" ? x.name : x.name.i18n[languageId],
    })),
  ];


  const { nodeCount, runningNodeCount, idleNodeCount, notAvailableNodeCount,
    cpuCoreCount, runningCpuCount, idleCpuCount, notAvailableCpuCount,
    gpuCoreCount, runningGpuCount, idleGpuCount, notAvailableGpuCount, runningJobCount, pendingJobCount,
  } = selectItem ?? {
    nodeCount: 0,
    runningNodeCount: 0,
    idleNodeCount: 0,
    notAvailableNodeCount: 0,
    cpuCoreCount: 0,
    runningCpuCount: 0,
    idleCpuCount: 0,
    notAvailableCpuCount: 0,
    gpuCoreCount: 0,
    runningGpuCount: 0,
    idleGpuCount: 0,
    notAvailableGpuCount: 0,
    jobCount: 0,
    runningJobCount: 0,
    pendingJobCount: 0,
  };


  return (
    <Card
      style={{ width:"100%" }}
      tabList={clusterCardsList}
      activeTabKey={activeTabKey}
      onTabChange={onTabChange}
    >
      <Row justify="space-between">
        <Col md={8} xl={6}>
          <InfoPaneContainer>
            <InfoPane
              strokeColor={colors.nodeUtilizationStroke}
              loading={loading}
              tag={{ itemName:t(p("node")), num:nodeCount }}
              paneData={ [{ itemName:t(p("running")), num:runningNodeCount, color:colors.nodeUtilizationAvailable },
                { itemName:t(p("idle")), num:idleNodeCount, color:colors.nodeUtilizationNotavailable },
                { itemName:t(p("notAvailable")), num:notAvailableNodeCount, color:colors.nodeUtilizationNotavailable }]}
            ></InfoPane>
          </InfoPaneContainer>
        </Col>
        <Col md={16} xl={12}>
          <DoubleInfoPaneContainer>
            <DoubleInfoPane
              strokeColor={[colors.cpuStroke, colors.gpuStroke]}
              loading={loading}
              cpuInfo={{
                tag:{ itemName:"CPU", num:cpuCoreCount, unit:t(p("core")) },
                paneData: [
                  { itemName:t(p("running")), num:runningCpuCount, color:colors.cpuAvailable },
                  { itemName:t(p("idle")), num:idleCpuCount, color:colors.cpunotAvailable },
                  { itemName:t(p("notAvailable")), num:notAvailableCpuCount, color:colors.cpunotAvailable },
                ]}}
              gpuInfo={{
                title:{ title:"", subTitle:"" },
                tag:{ itemName:"GPU", num:gpuCoreCount, unit:t(p("card")) },
                paneData: [
                  { itemName:t(p("running")), num:runningGpuCount, color:colors.gpuAvailable },
                  { itemName:t(p("idle")), num:idleGpuCount, color:colors.gpunotAvailable },
                  { itemName:t(p("notAvailable")), num:notAvailableGpuCount, color:colors.gpunotAvailable },
                ]}}
            ></DoubleInfoPane>
          </DoubleInfoPaneContainer>
        </Col>
        <Col md={8} xl={6}>
          <InfoPaneContainer>
            <JobInfo
              runningJobs={`${runningJobCount}`}
              pendingJobs={`${pendingJobCount}`}
              loading={loading}
              display={!(runningJobCount == 0 && pendingJobCount == 0)}
            />
          </InfoPaneContainer>
        </Col>
      </Row>
    </Card>
  );
};
