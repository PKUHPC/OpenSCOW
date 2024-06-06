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

import { Card, Tag } from "antd";
import React, { useMemo } from "react";
import { PieChartCom } from "src/pageComponents/dashboard/PieChartCom";
import { styled } from "styled-components"; ;
import { gray } from "@ant-design/colors";

import { Line, PaneData, PieChartContainer, Tag as TagProps, Title, TitleContainer } from "./InfoPane";

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
margin: 20px 0;
`;

const UpperContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const LowerContainer = styled.div`
  display: flex;
  /* CPU和GPU两个信息面板的间隔距离 */
  & > :first-child {
  margin-right: 40px;
  }
`;

const ResourceContainer = styled.div`
  flex: 1;
`;

export const DoubleInfoPane: React.FC<Props> = ({ cpuInfo, gpuInfo, loading, strokeColor }) => {

  const cpuNotEmptyData = useMemo(() => {
    return cpuInfo.paneData.some((x) => x.num > 0);
  }, [cpuInfo.paneData]);

  const gpuNotEmptyData = useMemo(() => {
    return gpuInfo.paneData.some((x) => x.num > 0);
  }, [gpuInfo.paneData]);

  return (
    <Container>
      <Card bordered={false} loading={loading}>
        <UpperContainer>
          {cpuInfo.title ? (
            <TitleContainer>
              <span>{cpuInfo.title.title}</span>
              <span>{cpuInfo.title.subTitle ? `[${cpuInfo.title.subTitle}]` : " "} </span>
            </TitleContainer>
          )
            : undefined}
        </UpperContainer>
        <LowerContainer>
          <ResourceContainer>
            <div>
              <Tag
                style={{ width:"100%", height: "24px", lineHeight:"24px", fontSize:"14px",
                  display:"flex", justifyContent:"center" }}
                bordered={true}
              >
                {cpuInfo.tag.itemName}
                <b>&nbsp;{cpuInfo.tag.num}</b>
                {cpuInfo.tag.unit}
              </Tag>
            </div>
            <div style={{ height:"120px" }}>
              {
                cpuInfo.paneData.map((item, idx) =>
                  <Line key={idx} itemName={item.itemName} num={item.num} color={item.color}></Line>)
              }
            </div>
            <PieChartContainer>
              {/* 数据全为空时,饼图置灰 */}
              {cpuNotEmptyData ? (
                <PieChartCom
                  pieData={cpuInfo.paneData.map((item) => ({ value:item.num, color:item.color }))}
                  strokeColor={strokeColor[0]}
                ></PieChartCom>
              ) :
                <PieChartCom pieData={[{ value:1, color:gray[4] }]} strokeColor={strokeColor[0]}></PieChartCom>}
            </PieChartContainer>
          </ResourceContainer>
          <ResourceContainer>
            <div>
              <Tag
                style={{ width:"100%", height: "24px", lineHeight:"24px", fontSize:"14px",
                  display:"flex", justifyContent:"center" }}
                bordered={true}
              >
                {gpuInfo.tag.itemName}
                <b>&nbsp;{gpuInfo.tag.num}</b>
                {gpuInfo.tag.unit}
              </Tag>
            </div>
            <div style={{ height:"120px" }}>
              {
                gpuInfo.paneData.map((item, idx) =>
                  <Line key={idx} itemName={item.itemName} num={item.num} color={item.color}></Line>)
              }
            </div>
            <PieChartContainer>
              {/* 数据全为空时,饼图置灰 */}
              {gpuNotEmptyData ? (
                <PieChartCom
                  pieData={gpuInfo.paneData.map((item) => ({ value:item.num, color:item.color }))}
                  strokeColor={strokeColor[1]}
                ></PieChartCom>
              ) :
                <PieChartCom pieData={[{ value:1, color:gray[4] }]} strokeColor={strokeColor[1]}></PieChartCom>}
            </PieChartContainer>
          </ResourceContainer>
        </LowerContainer>
      </Card>
    </Container>

  );
};
