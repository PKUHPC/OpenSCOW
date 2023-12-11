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

"use client";

import { Typography } from "antd";
import { styled } from "styled-components";

const BgContainer = styled.div`
  width: 100vw;
  height: 100vh;
  min-width: 600px;
  min-height: 700px;
  background-size: cover;
  position: relative;
`;

const LogoContainer = styled.img`
  position: absolute;
  left: 1vw;
  top: 2vh;
  width: 200px;
`;

const ChildrenContainer = styled.div`
  position: absolute;
  left: 16vw;
  top: 20vh;
  /* 保证输入框始终清楚可见 */
  z-index: 10;
`;

const DescContainer = styled.div`
  position: absolute;
  left: 60vw;
  top: 20vh;
`;

const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-top: 100px;
`;
interface Props {
  children: React.ReactNode
  top?: string;
}
export const LoginBg: React.FC<Props> = ({ children, top }) => {

  return (
    <BgContainer>
      <ChildrenContainer style={top ? { top:`${top}vh` } : {}}>
        {children}
      </ChildrenContainer>
      <DescContainer>
        <Typography.Title style={{ fontSize:"50px", color:"#fff" }}>算力网络融合平台</Typography.Title>
        <TextContainer>
          <Typography.Title level={2} style={{ color:"#fff" }}>灵活接入</Typography.Title>
          <Typography.Title level={2} style={{ color:"#fff" }}>统一调度</Typography.Title>
          <Typography.Title level={2} style={{ color:"#fff" }}>结算便利</Typography.Title>
        </TextContainer>
      </DescContainer>
    </BgContainer>
  );
};
