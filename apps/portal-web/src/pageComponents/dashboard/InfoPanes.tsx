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
import { ClusterInfo } from "src/pageComponents/dashboard/OveriewTable";

interface Props {
  selectItem: ClusterInfo
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

export const InfoPanes: React.FC<Props> = ({ selectItem }) => {

  const { clusterName, partitionName, nodes, runningNodes, idleNodes, noAviailableNodes,
    cpuCores, runningCpus, idleCpus, noAviailableCpus,
    gpuCores, runningGpus, idleGpus, noAviailableGpus,
    jobNum, runningJob, pendingJob,
  } = selectItem;
  return (
    <Container>
      <InfoPane
        title={{ title:"节点信息", subTitle:`${clusterName}-${partitionName}` }}
        tag={{ itemName:"节点", num:nodes }}
        data={ [{ itemName:"运行中", num:runningNodes, color:"#00C49F" },
          { itemName:"空闲", num:idleNodes, color:"#0088FE" },
          { itemName:"不可用", num:noAviailableNodes, color:"#c04851" }]}
      ></InfoPane>
      <InfoPaneContainer>
        <InfoPane
          title={{ title:"资源信息", subTitle:`${clusterName}-${partitionName}` }}
          tag={{ itemName:"CPU", num:cpuCores, unit:"核" }}
          data={ [{ itemName:"运行中", num:runningCpus, color:"#00C49F" },
            { itemName:"空闲", num:idleCpus, color:"#0088FE" },
            { itemName:"不可用", num:noAviailableCpus, color:"#c04851" }]}
        ></InfoPane>
        <InfoPane
          title={{ title:"", subTitle:"" }}
          tag={{ itemName:"GPU", num:gpuCores, unit:"卡" }}
          data={ [{ itemName:"运行中", num:runningGpus, color:"#00C49F" },
            { itemName:"空闲", num:idleGpus, color:"#0088FE" },
            { itemName:"不可用", num:noAviailableGpus, color:"#c04851" }]}
        ></InfoPane>
      </InfoPaneContainer>
      <InfoPane
        title={{ title:"作业", subTitle:`${clusterName}-${partitionName}` }}
        tag={{ itemName:"作业", num:jobNum }}
        data={ [{ itemName:"运行中", num:runningJob, color:"#00C49F" },
          { itemName:"排队中", num:pendingJob, color:"#c04851" }]}
      ></InfoPane>
    </Container>

  );
};
