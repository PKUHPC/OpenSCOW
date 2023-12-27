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
import { cyan, geekblue, red } from "@ant-design/colors";
import { getI18nConfigCurrentText } from "@scow/lib-web/build/utils/systemLanguage";
import { Col, Row } from "antd";
import { prefix, useI18n, useI18nTranslateToString } from "src/i18n";
import { ClusterInfo } from "src/pageComponents/dashboard/OverviewTable";

interface Props {
  selectItem: ClusterInfo;
  loading: boolean;
}

const Container = styled.div`

`;

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
  running:cyan[5],
  idle:geekblue[5],
  notAvailable:red[8],
};
const p = prefix("pageComp.dashboard.infoPanes.");
export const InfoPanes: React.FC<Props> = ({ selectItem, loading }) => {

  const t = useI18nTranslateToString();
  const languageId = useI18n().currentLanguage.id;

  const { clusterName, partitionName, nodeCount, runningNodeCount, idleNodeCount, notAvailableNodeCount,
    cpuCoreCount, runningCpuCount, idleCpuCount, notAvailableCpuCount,
    gpuCoreCount, runningGpuCount, idleGpuCount, notAvailableGpuCount,
    jobCount, runningJobCount, pendingJobCount,
  } = selectItem;

  return (
    <Container>
      <Row justify="space-between">
        <Col md={8} xl={6}>
          <InfoPaneContainer>
            <InfoPane
              loading={loading}
              title={{
                title:t(p("nodeInfo")),
                subTitle:`${getI18nConfigCurrentText(clusterName, languageId)}-${partitionName}`,
              }}
              tag={{ itemName:t(p("node")), num:nodeCount }}
              paneData={ [{ itemName:t(p("running")), num:runningNodeCount, color:colors.running },
                { itemName:t(p("idle")), num:idleNodeCount, color:colors.idle },
                { itemName:t(p("notAvailable")), num:notAvailableNodeCount, color:colors.notAvailable }]}
            ></InfoPane>
          </InfoPaneContainer>
        </Col>
        <Col md={16} xl={12}>
          <DoubleInfoPaneContainer>
            <DoubleInfoPane
              loading={loading}
              cpuInfo={{
                title:{
                  title:t(p("resourceInfo")),
                  subTitle:`${getI18nConfigCurrentText(clusterName, languageId)}-${partitionName}`,
                },
                tag:{ itemName:"CPU", num:cpuCoreCount, unit:t(p("core")) },
                paneData: [{
                  itemName:t(p("running")), num:runningCpuCount, color:colors.running },
                { itemName:t(p("idle")), num:idleCpuCount, color:colors.idle },
                { itemName:t(p("notAvailable")), num:notAvailableCpuCount, color:colors.notAvailable },
                ]}}
              gpuInfo={{
                title:{ title:"", subTitle:"" },
                tag:{ itemName:"GPU", num:gpuCoreCount, unit:t(p("card")) },
                paneData: [
                  { itemName:t(p("running")), num:runningGpuCount, color:colors.running },
                  { itemName:t(p("idle")), num:idleGpuCount, color:colors.idle },
                  { itemName:t(p("notAvailable")), num:notAvailableGpuCount, color:colors.notAvailable },
                ]}}
            ></DoubleInfoPane>
          </DoubleInfoPaneContainer>
        </Col>

        <Col md={8} xl={6}>
          <InfoPaneContainer>
            <InfoPane
              loading={loading}
              title={{ title:t(p("job")),
                subTitle:`${getI18nConfigCurrentText(clusterName, languageId)}-${partitionName}`,
              }}
              tag={{ itemName:t(p("job")), num:jobCount }}
              paneData={ [{ itemName:t(p("running")), num:runningJobCount, color:colors.running },
                { itemName:t(p("pending")), num:pendingJobCount, color:colors.notAvailable }]}
            ></InfoPane>
          </InfoPaneContainer>
        </Col>
      </Row>
    </Container>

  );
};
