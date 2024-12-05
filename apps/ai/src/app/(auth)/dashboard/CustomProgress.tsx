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
import styled, { useTheme } from "styled-components";

interface CustomProgressProps {
  percent: number; // 进度百分比
  width?: string; // 进度条的宽度，默认100%
  height?: string; // 进度条的高度，默认20px
  bgColor?: string; // 进度条背景颜色
  progressColor?: string; // 进度条颜色
}

const ProgressBarContainer = styled.div<{ width: string, height: string, bgColor: string }>`
  display: flex;
  align-items: center;
  width: ${(props) => props.width};
  height: ${(props) => props.height};
  background-color: ${(props) => props.bgColor};
  border-radius: 5px;
`;

const ProgressBar = styled.div<{ percent: number, progressColor: string }>`
  height: 100%;
  background-color: ${(props) => props.progressColor};
  border-radius: 5px;
  transition: width 0.3s ease;
  width: ${(props) => props.percent}%;
`;

const ProgressLabel = styled.div`
  width: 50px;
  margin-left: 10px;
  text-align: right;
  font-size: 0.9rem;
`;



export const CustomProgress: React.FC<CustomProgressProps> = ({
  percent,
  width = "100%",
  height = "20px",
  bgColor,
  progressColor,
}) => {
  const normalizedPercent = Math.min(percent, 100).toFixed(2);

  // 使用主题色
  const theme = useTheme();

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <ProgressBarContainer width={width} height={height} bgColor={bgColor ?? theme.token.colorBorderBg}>
        <ProgressBar percent={percent} progressColor={progressColor ?? theme.token["blue-4"]} />
      </ProgressBarContainer>
      <ProgressLabel>
        {percent === 100 ? "100%" : `${normalizedPercent}%`}
      </ProgressLabel>
    </div>
  );
};


