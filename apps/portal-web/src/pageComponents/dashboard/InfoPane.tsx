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
import React from "react";
import { PieChartCom } from "src/pageComponents/dashboard/PieChartCom";
import { styled } from "styled-components"; ;

interface LineProps {
  itemName: string;
  num: number;
  color: string;
}

const LineContainer = styled.div`
  height: 40px;
  line-height: 40px;
  display: flex;
  justify-content: space-between;
  padding: 5px 20px;
  border-bottom: 1px solid #ccc;
`;

const Line: React.FC<LineProps> = ({ itemName, num, color }) => {
  return (
    <LineContainer style={{ color }}>
      <span>{itemName}</span>
      <span>{num}</span>
    </LineContainer>
  );
};

interface Title {
  title: string;
  subTitle: string;
}

interface Tag {
  itemName: string;
  num: number;
  unit?: string;
}

interface PaneData {
  itemName: string;
  num: number;
  color: string;
}
interface Props {
  title?: Title;
  tag: Tag;
  paneData: PaneData[];
  loading: boolean;
}

const Container = styled.div`
  .ant-card-body{
    padding: 5px 24px !important;
  }
`;

const TitleContainer = styled.div`
  height: 45px;
  font-size: 16px;
  padding-bottom: 20px;
`;
const SubTitle = styled.span`
  color: #999;
`;
export const InfoPane: React.FC<Props> = ({ title, tag, paneData, loading }) => {

  return (
    <Container>
      <Card style={{ width: 300 }} bordered={false} loading={loading}>
        {title ? (
          <TitleContainer>
            <span>{title.title}</span>
            <SubTitle>{title.subTitle ? `[${title.subTitle}]` : " "} </SubTitle>
          </TitleContainer>
        )
          : undefined}
        <div>
          <Tag
            style={{ width:"100%", height: "24px", lineHeight:"24px", fontSize:"14px",
              borderColor:"#eee", color:"#000", display:"flex", justifyContent:"center" }}
            color="#fff"
            bordered={true}
          >
            {tag.itemName}
            <b>&nbsp;{tag.num}</b>
            {tag.unit}
          </Tag>
        </div>
        <div style={{ height:"120px" }}>
          {
            paneData.map((item, idx) =>
              <Line key={idx} itemName={item.itemName} num={item.num} color={item.color}></Line>)
          }
        </div>
        <PieChartCom pieData={paneData.map((item) => ({ value:item.num, color:item.color }))}></PieChartCom>
      </Card>

    </Container>

  );
};
