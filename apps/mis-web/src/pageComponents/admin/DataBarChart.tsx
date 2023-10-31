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

import { Empty, Spin } from "antd";
import React from "react";
import { Bar, BarChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { styled } from "styled-components";

interface Props {
  isLoading: boolean
  title: string
  data: {x: string, y: string | number}[]
  xLabel?: string
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

export const DataBarChart: React.FC<Props> = ({
  title,
  data,
  isLoading,
  xLabel = "",
}) => {

  return (
    <StatisticContainer>
      {isLoading ? <Spin /> : (
        <>
          <StatisticTitle>{ title }</StatisticTitle>
          {data.length === 0 ?
            <Empty />
            : (
              <ResponsiveContainer height="100%">
                <BarChart
                  data={data}
                >
                  <XAxis
                    dataKey="x"
                    padding={{ left: 20, right: 20 }}
                    label={{ value: xLabel, position: "insideBottom", offset: 0 }}
                    height={40}
                  />
                  <YAxis padding={{ top: 20 }} />
                  <Tooltip />
                  <Bar dataKey="y" fill="#8884d8" barSize={ 40 } />
                </BarChart>
              </ResponsiveContainer>
            )}
        </>
      )}
    </StatisticContainer>

  );

};
