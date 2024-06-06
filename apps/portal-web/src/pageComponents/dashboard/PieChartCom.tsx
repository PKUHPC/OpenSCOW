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
}

interface PieData {
  value: number;
  color: string;
}

const Container = styled.div`
`;

export const PieChartCom: React.FC<Props> = ({ pieData, strokeColor }) => {
  console.log(strokeColor + "Pie");
  return (
    <Container>
      <PieChart width={220} height={220}>
        <Pie
          data={[{ name:"test", value:100 }]}
          cx={105}
          cy={110}
          innerRadius={40}
          outerRadius={60}
          dataKey="value"
          stroke="none"
        >
          <Cell fill={strokeColor} stroke="none" />
        </Pie>
        <Pie
          data={pieData}
          cx={105}
          cy={110}
          innerRadius={60}
          outerRadius={80}
          dataKey="value"
          stroke="none"
        >
          {pieData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
          ))}
        </Pie>
        <Pie
          data={[{ name:"test", value:100 }]}
          cx={105}
          cy={110}
          innerRadius={80}
          outerRadius={100}
          dataKey="value"
        >
          <Cell fill={strokeColor} stroke="none" />
        </Pie>
      </PieChart>
    </Container>
  );
};
