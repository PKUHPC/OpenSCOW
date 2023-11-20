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
}

interface PieData {
  value: number;
  color: string;
}

const Container = styled.div`
`;

export const PieChartCom: React.FC<Props> = ({ pieData }) => {
  return (
    <Container>
      <PieChart width={800} height={220}>
        <Pie
          data={pieData}
          cx={120}
          cy={100}
          innerRadius={60}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {pieData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
      </PieChart>
    </Container>
  );
};
