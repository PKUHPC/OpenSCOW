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
import styled from "styled-components";

interface CustomProgressProps {
  percent: number; // 进度百分比
  width?: string; // 进度条的宽度，默认100%
  height?: string; // 进度条的高度，默认20px
}

const ProgressBarContainer = styled.div<{ width: string, height: string }>`
  display: flex;
  align-items: center;
  width: ${(props) => props.width};
  height: ${(props) => props.height};
  background-color: var(--ant-fill-1); // 使用 Ant Design 的背景颜色变量
  border-radius: 5px;
`;

const ProgressBar = styled.div<{ percent: number }>`
  height: 100%;
  background-color: var(--ant-primary-color); // 使用 Ant Design 的主题色变量
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
}) => {
  const normalizedPercent = Math.min(percent, 100).toFixed(2);

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <ProgressBarContainer width={width} height={height}>
        <ProgressBar percent={percent} />
      </ProgressBarContainer>
      <ProgressLabel>
        {percent === 100 ? "100%" : `${normalizedPercent}%`}
      </ProgressLabel>
    </div>
  );
};
