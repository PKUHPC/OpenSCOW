/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * OpenSCOW is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

"use client";
import { Descriptions, Typography } from "antd";
import { usePublicConfig } from "src/app/(auth)/context";
import { ModalButton } from "src/components/ModalLink";
import { Section } from "src/components/Section";
import { antdBreakpoints } from "src/styles/constants";
import { Head } from "src/utils/head";
import { styled } from "styled-components";

import { ChangePasswordModal } from "./ChangePasswordModal";

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
`;

const Part = styled(Section)`
  min-width: 400px;
  max-width: 600px;
  flex: 1;
  margin: 0 8px 16px 0;
  @media (min-width: ${antdBreakpoints.md}px) {
    margin: 0 16px 32px 0;
  }
`;

const TitleText = styled(Typography.Title)`
&& {
  width: 100vw;
  font-weight: 700;
  font-size: 24px;
  padding: 0 0 10px 20px;
  margin-left: -25px;
  border-bottom: 1px solid #ccc;
  @media (min-width: ${antdBreakpoints.md}px) {
    padding: 0 0 20px 30px;
  }
}
`;

const ChangePasswordModalButton = ModalButton(ChangePasswordModal, { type: "link" });

export default function Page() {

  const { publicConfig, user } = usePublicConfig();

  return (
    <Container>
      <Head title="账号信息" />
      <TitleText>
        用户信息
      </TitleText>
      <Part title>
        <Descriptions
          column={1}
          labelStyle={{ paddingLeft:"10px", marginBottom:"10px" }}
          contentStyle={{ paddingLeft:"10px" }}
        >
          <Descriptions.Item label="用户ID">
            {user.identityId}
          </Descriptions.Item>
          <Descriptions.Item label="用户姓名">
            {user.name}
          </Descriptions.Item>
        </Descriptions>
      </Part>
      {
        publicConfig.ENABLE_CHANGE_PASSWORD ? (
          <>
            <TitleText>
              修改密码
            </TitleText>
            <Part title>
              <Descriptions
                column={1}
                labelStyle={{ paddingLeft:"10px", paddingTop:"5px" }}
                contentStyle={{ paddingLeft:"10px" }}
              >
                <Descriptions.Item label="登录密码">
                  <span style={{ width:"200px" }}>********</span>
                  <ChangePasswordModalButton identityId={user.identityId}>
                    修改密码
                  </ChangePasswordModalButton>
                </Descriptions.Item>
              </Descriptions>
            </Part>
          </>
        ) : undefined
      }
    </Container>
  );
}
