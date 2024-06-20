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
import { styled } from "styled-components";

import { TitleContainer } from "./TitleContainer";

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

export const Line: React.FC<LineProps> = ({ itemName, num, color }) => {
  return (
    <LineContainer style={{ color }}>
      <span>{itemName}</span>
      <span>{num}</span>
    </LineContainer>
  );
};

export interface Title {
  title: string;
  subTitle: string;
}

export interface Tag {
  itemName: string;
  num: number;
  unit?: string;
  subName: string;
}

export interface PaneData {
  itemName: string;
  num: number;
  color: string;
}
interface Props {
  tag: Tag;
  paneData: PaneData[];
  loading: boolean;
}

const Container = styled.div`
margin: 0px 0;
`;

export const PieChartContainer = styled.div`
  display: flex;
  justify-content: center;
`;

export const InfoPane: React.FC<Props> = ({ tag, paneData, loading }) => {

  const notEmptyData = useMemo(() => {
    return paneData.some((x) => x.num > 0);
  }, [paneData]);

  return (
    <Container>
      <Card
        loading={loading}
        type="inner"
        title={ (
          <TitleContainer
            name={tag.itemName}
            subName={tag.subName}
            total={paneData.reduce((a, b) => a + b.num, 0)}
            available={paneData[1].num}
            display={tag.itemName == "GPU" ? notEmptyData : true}
          ></TitleContainer>
        )}
        style={{ maxHeight:"310px", boxShadow: "0px 2px 10px 0px #1C01011A" }}
      >
        <PieChartContainer>
          <PieChartCom
            pieData={paneData.map((item) => ({ value:isNaN(item.num) ? 0 : item.num,
              color:item.color, itemName:item.itemName }))}
            range={Math.round((paneData[0].num / paneData.reduce((a, b) => a + b.num, 0)) * 100) }
            display={tag.itemName == "GPU" ? notEmptyData : true}
            total={paneData.reduce((a, b) => a + b.num, 0)}
          ></PieChartCom>
        </PieChartContainer>
      </Card>

    </Container>

  );
};
