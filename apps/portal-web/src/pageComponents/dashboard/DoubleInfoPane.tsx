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

import { Card } from "antd";
import React, { useMemo } from "react";
import { styled } from "styled-components"; ;
import { prefix, useI18nTranslateToString } from "src/i18n";

import { PaneData, PieChartContainer, Tag as TagProps, Title } from "./InfoPane";
import { TitleContainer } from "./TitleContainer";

interface InfoProps {
  title?: Title;
  tag: TagProps;
  paneData: PaneData[];
}

interface Props {
  cpuInfo: InfoProps;
  gpuInfo: InfoProps;
  loading: boolean;
  strokeColor: [string, string]
}

const Container = styled.div`
margin: 0px 0;
`;

const LowerContainer = styled.div`
  display: flex;
  justify-content:space-between
`;

const ResourceContainer = styled.div`
  flex: 1;
`;

const p = prefix("pageComp.dashboard.doubleInfoPane.");

export const DoubleInfoPane: React.FC<Props> = ({ cpuInfo, gpuInfo, loading }) => {

  const t = useI18nTranslateToString();

  const cpuNotEmptyData = useMemo(() => {
    return cpuInfo.paneData.some((x) => x.num > 0);
  }, [cpuInfo.paneData]);

  const gpuNotEmptyData = useMemo(() => {
    return gpuInfo.paneData.some((x) => x.num > 0);
  }, [gpuInfo.paneData]);


  return (
    <Container>
      <Card
        loading={loading}
        type="inner"
        style={{ maxHeight:"310px",
          boxShadow: "0px 2px 10px 0px #1C01011A",
        }}
        title={(
          <div style={{ display:"flex", gap:"15px" }}>
            <TitleContainer
              subName=""
              name={t(p("CPUCoreUsage"))}
              total={cpuInfo.paneData.reduce((a, b) => a + b.num, 0)}
              available={cpuInfo.paneData[1].num}
              display={cpuNotEmptyData}
            ></TitleContainer>
            <TitleContainer
              subName=""
              name={t(p("GPUCoreUsage"))}
              total={gpuInfo.paneData.reduce((a, b) => a + b.num, 0)}
              available={gpuInfo.paneData[1].num}
              display={gpuNotEmptyData}
            ></TitleContainer>
          </div>
        )}
      >
        <LowerContainer>
          <ResourceContainer>
            <PieChartContainer>
            </PieChartContainer>
          </ResourceContainer>
          <ResourceContainer>
            <PieChartContainer>
            </PieChartContainer>
          </ResourceContainer>
        </LowerContainer>
      </Card>
    </Container>

  );
};
