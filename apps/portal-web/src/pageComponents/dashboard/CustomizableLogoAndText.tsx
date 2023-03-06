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

import { useDarkMode } from "@scow/lib-web/build/layouts/darkMode";
import { Divider, Typography } from "antd";
import { join } from "path";
import React from "react";
import { publicConfig } from "src/utils/config";
import styled from "styled-components";

interface Props {
  homeTitle: string;
  homeText: string;
}

const Container = styled.div`
`;

const Logo = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
`;

const TitleAndText = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 3%;
  margin-left: 20%;
  margin-right: 20%;
  flex-direction: column;
`;

const Title = styled(Typography.Title)`
  align-self: center;
`;

const Text = styled(Typography.Paragraph)`
`;

export const CustomizableLogoAndText: React.FC<Props> = ({ homeText, homeTitle }) => {

  const { dark } = useDarkMode();

  const query = new URLSearchParams({ type: "banner", preferDark: dark ? "true" : "false" }).toString();

  return (
    <Container>
      <Logo>
        <img
          alt="logo"
          src={join(publicConfig.BASE_PATH, "/api/logo?" + query)}
          style={{
            objectFit: "contain",
            maxWidth: "100%",
          }}
        />
      </Logo>
      <TitleAndText>
        <Title>
          <div dangerouslySetInnerHTML={{ __html: homeTitle }} />
        </Title>
        <Divider />
        <Text>
          <div dangerouslySetInnerHTML={{ __html: homeText }} />
        </Text>
      </TitleAndText>
    </Container>

  );
};
