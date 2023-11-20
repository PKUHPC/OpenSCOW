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

export const InfoPanes: React.FC<Props> = ({ selectItem, loading }) => {

  const { clusterName, partitionName, nodeCount, runningNodeCount, idleNodeCount, notAvailableNodeCount,
    cpuCoreCount, runningCpuCount, idleCpuCount, notAvailableCpuCount,
    gpuCoreCount, runningGpuCount, idleGpuCount, notAvailableGpuCount,
    jobCount, runningJobCount, pendingJobCount,
  } = selectItem;
  return (
    <Container>
      <InfoPane
        loading={loading}
        title={{ title:"节点信息", subTitle:`${clusterName}-${partitionName}` }}
        tag={{ itemName:"节点", num:nodeCount }}
        paneData={ [{ itemName:"运行中", num:runningNodeCount, color:"#00C49F" },
          { itemName:"空闲", num:idleNodeCount, color:"#0088FE" },
          { itemName:"不可用", num:notAvailableNodeCount, color:"#c04851" }]}
      ></InfoPane>
      <InfoPaneContainer>
        <InfoPane
          loading={loading}
          title={{ title:"资源信息", subTitle:`${clusterName}-${partitionName}` }}
          tag={{ itemName:"CPU", num:cpuCoreCount, unit:"核" }}
          paneData={ [{ itemName:"运行中", num:runningCpuCount, color:"#00C49F" },
            { itemName:"空闲", num:idleCpuCount, color:"#0088FE" },
            { itemName:"不可用", num:notAvailableCpuCount, color:"#c04851" }]}
        ></InfoPane>
        <InfoPane
          loading={loading}
          title={{ title:"", subTitle:"" }}
          tag={{ itemName:"GPU", num:gpuCoreCount, unit:"卡" }}
          paneData={ [{ itemName:"运行中", num:runningGpuCount, color:"#00C49F" },
            { itemName:"空闲", num:idleGpuCount, color:"#0088FE" },
            { itemName:"不可用", num:notAvailableGpuCount, color:"#c04851" }]}
        ></InfoPane>
      </InfoPaneContainer>
      <InfoPane
        loading={loading}
        title={{ title:"作业", subTitle:`${clusterName}-${partitionName}` }}
        tag={{ itemName:"作业", num:jobCount }}
        paneData={ [{ itemName:"运行中", num:runningJobCount, color:"#00C49F" },
          { itemName:"排队中", num:pendingJobCount, color:"#c04851" }]}
      ></InfoPane>
    </Container>

  );
};
