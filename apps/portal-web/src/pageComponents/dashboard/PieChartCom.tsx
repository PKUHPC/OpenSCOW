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
import { styled } from "styled-components"; ;
import { Cell, Pie, PieChart } from "recharts";

interface Props {
  pieData: PieData[];
  strokeColor: string;
  range: number;
  display: boolean;
}

interface PieData {
  value: number;
  color: string;
}

const Container = styled.div`
  position:relative;
  bottom:5.4em;
`;

const JobRange = styled.div`
  font-weight:700;
  position:relative;
  width:max-content;
  left:50%;
  top:50%;
  transform: translate(-52%,0);
`;

export const PieChartCom: React.FC<Props> = ({ pieData, range, strokeColor, display }) => {

  // 没有值的时候不显示
  if (!display) {
    return null;
  }

  return (
    <Container>
      <JobRange style={{ color:pieData[0].color, fontSize:"3.4em" }}>
        {Math.min(range, 100) + "%"}
      </JobRange>
      <PieChart width={230} height={230}>
        <Pie
          data={[{ name:"inner", value:100 }]}
          cx={105}
          cy={110}
          innerRadius={70}
          outerRadius={80}
          dataKey="value"
          stroke="none"
        >
          <Cell fill={strokeColor} stroke="none" />
        </Pie>
        <Pie
          data={pieData}
          cx={105}
          cy={110}
          innerRadius={80}
          outerRadius={90}
          dataKey="value"
          stroke="none"
        >
          {pieData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
          ))}
        </Pie>
        <Pie
          data={[{ name:"outter", value:100 }]}
          cx={105}
          cy={110}
          innerRadius={90}
          outerRadius={100}
          dataKey="value"
        >
          <Cell fill={strokeColor} stroke="none" />
        </Pie>
      </PieChart>
    </Container>
  );
};
