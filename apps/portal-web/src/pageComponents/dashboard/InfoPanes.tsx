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

import React, { useState } from "react";
import { DoubleInfoPane } from "src/pageComponents/dashboard/DoubleInfoPane";
import { InfoPane } from "src/pageComponents/dashboard/InfoPane";
import { styled } from "styled-components"; ;
import { getI18nConfigCurrentText } from "@scow/lib-web/build/utils/systemLanguage";
import { color } from "@uiw/react-codemirror";
import { Card, Col, Row } from "antd";
import { useStore } from "simstate";
import { prefix, useI18n, useI18nTranslateToString } from "src/i18n";
import { ClusterInfo } from "src/pageComponents/dashboard/OverviewTable";
import { ClusterInfoStore } from "src/stores/ClusterInfoStore";

interface Props {
  selectItem: ClusterInfo;
  loading: boolean;
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
export const InfoPanes: React.FC<Props> = ({ selectItem, loading }) => {

  const t = useI18nTranslateToString();
  const languageId = useI18n().currentLanguage.id;

  const { currentClusters } = useStore(ClusterInfoStore);

  // card的每一项
  const clusterCardsList = [
    {
      key:"platformOverview",
      tab:"platformOverview",
    }, ...currentClusters.map((x) => ({
      key:x.id,
      tab:typeof (x.name) == "string" ? x.name : x.name.i18n[languageId],
    })),
  ];

  const [activeTabKey, setActiveTabKey] = useState<string>(clusterCardsList[0].key);

  const onTabChange = (key: string) => {
    setActiveTabKey(key);
  };


  const { clusterName, partitionName, nodeCount, runningNodeCount, idleNodeCount, notAvailableNodeCount,
    cpuCoreCount, runningCpuCount, idleCpuCount, notAvailableCpuCount,
    gpuCoreCount, runningGpuCount, idleGpuCount, notAvailableGpuCount,
    jobCount, runningJobCount, pendingJobCount,
  } = selectItem;

  return (
    <Card
      style={{ width: "100%" }}
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
              title={{
                title:t(p("nodeInfo")),
                subTitle:`${getI18nConfigCurrentText(clusterName, languageId)}-${partitionName ?? ""}`,
              }}
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
                title:{
                  title:t(p("resourceInfo")),
                  subTitle:`${getI18nConfigCurrentText(clusterName, languageId)}-${partitionName ?? ""}`,
                },
                tag:{ itemName:"CPU", num:cpuCoreCount, unit:t(p("core")) },
                paneData: [{
                  itemName:t(p("running")), num:runningCpuCount, color:colors.cpuAvailable },
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
            {/* <InfoPane
              loading={loading}
              title={{ title:t(p("job")),
                subTitle:`${getI18nConfigCurrentText(clusterName, languageId)}-${partitionName ?? ""}`,
              }}
              tag={{ itemName:t(p("job")), num:jobCount }}
              paneData={ [{ itemName:t(p("running")), num:runningJobCount, color:colors.running },
                { itemName:t(p("pending")), num:pendingJobCount, color:colors.notAvailable }]}
            ></InfoPane> */}
          </InfoPaneContainer>
        </Col>
      </Row>
    </Card>
  );
};
