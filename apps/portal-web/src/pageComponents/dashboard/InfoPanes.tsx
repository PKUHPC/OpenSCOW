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
import { InfoPane } from "src/pageComponents/dashboard/InfoPane";
import { styled } from "styled-components"; ;
import { prefix, useI18nTranslateToString } from "src/i18n";
import { ClusterInfo } from "src/pageComponents/dashboard/OverviewTable";

interface Props {
  selectItem: ClusterInfo;
  loading: boolean;
}

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 20px 0;
`;

const InfoPaneContainer = styled.div`
  display: flex;
  justify-content: flex-start;
`;

const colors = {
  running:"#00C49F",
  idle:"#0088FE",
  notAvailable:"#c04851",
};
const p = prefix("pageComp.dashboard.infoPanes.");
export const InfoPanes: React.FC<Props> = ({ selectItem, loading }) => {

  const t = useI18nTranslateToString();

  const { clusterName, partitionName, nodeCount, runningNodeCount, idleNodeCount, notAvailableNodeCount,
    cpuCoreCount, runningCpuCount, idleCpuCount, notAvailableCpuCount,
    gpuCoreCount, runningGpuCount, idleGpuCount, notAvailableGpuCount,
    jobCount, runningJobCount, pendingJobCount,
  } = selectItem;

  return (
    <Container>
      <InfoPane
        loading={loading}
        title={{ title:t(p("nodeInfo")), subTitle:`${clusterName}-${partitionName}` }}
        tag={{ itemName:t(p("node")), num:nodeCount }}
        paneData={ [{ itemName:t(p("running")), num:runningNodeCount, color:colors.running },
          { itemName:t(p("idle")), num:idleNodeCount, color:colors.idle },
          { itemName:t(p("notAvailable")), num:notAvailableNodeCount, color:colors.notAvailable }]}
      ></InfoPane>
      <InfoPaneContainer>
        <InfoPane
          loading={loading}
          title={{ title:t(p("resourceInfo")), subTitle:`${clusterName}-${partitionName}` }}
          tag={{ itemName:"CPU", num:cpuCoreCount, unit:t(p("core")) }}
          paneData={ [{ itemName:t(p("running")), num:runningCpuCount, color:colors.running },
            { itemName:t(p("idle")), num:idleCpuCount, color:colors.idle },
            { itemName:t(p("notAvailable")), num:notAvailableCpuCount, color:colors.notAvailable }]}
        ></InfoPane>
        <InfoPane
          loading={loading}
          title={{ title:"", subTitle:"" }}
          tag={{ itemName:"GPU", num:gpuCoreCount, unit:t(p("card")) }}
          paneData={ [{ itemName:t(p("running")), num:runningGpuCount, color:colors.running },
            { itemName:t(p("idle")), num:idleGpuCount, color:colors.idle },
            { itemName:t(p("notAvailable")), num:notAvailableGpuCount, color:colors.notAvailable }]}
        ></InfoPane>
      </InfoPaneContainer>
      <InfoPane
        loading={loading}
        title={{ title:t(p("job")), subTitle:`${clusterName}-${partitionName}` }}
        tag={{ itemName:t(p("job")), num:jobCount }}
        paneData={ [{ itemName:t(p("running")), num:runningJobCount, color:colors.running },
          { itemName:t(p("pending")), num:pendingJobCount, color:colors.notAvailable }]}
      ></InfoPane>
    </Container>

  );
};
