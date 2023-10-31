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

import { Spin } from "antd";
import { Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CurveType } from "recharts/types/shape/Curve";
import { styled } from "styled-components";

interface Props {
  isLoading: boolean
  title: string
  data: {x: string, y: string | number}[]
  lineType?: CurveType
}

export const StatisticContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  height: 300px;
`;


export const StatisticTitle = styled.div<{ justify?: string }>`
  display: flex;
  margin: 8px 0;
`;

export const DataLineChart: React.FC<Props> = ({ title, data, isLoading, lineType = "linear" }) => {

  return (
    <StatisticContainer>
      {isLoading ? <Spin /> : (
        <>
          <StatisticTitle>{ title }</StatisticTitle>
          <ResponsiveContainer height="100%">
            <LineChart
              data={data}
            >
              <XAxis dataKey="x" padding={{ left: 20, right: 20 }} type="category" />
              <YAxis padding={{ top: 20 }} />
              <Tooltip />
              <Line type={ lineType } dataKey="y" stroke="#8884d8" connectNulls={true} />
            </LineChart>
          </ResponsiveContainer>
        </>
      )}
    </StatisticContainer>

  );

};
