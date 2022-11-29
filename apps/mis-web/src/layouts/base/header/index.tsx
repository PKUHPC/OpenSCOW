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

import { ArrowRightOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { Space, Typography } from "antd";
import { join } from "path";
import React from "react";
import { antdBreakpoints } from "src/layouts/base/constants";
import { BigScreenMenu } from "src/layouts/base/header/BigScreenMenu";
import { DefaultClusterSelector } from "src/layouts/base/header/DefaultClusterSelector";
import { Logo } from "src/layouts/base/header/Logo";
import { NavItemProps } from "src/layouts/base/NavItemProps";
import { User } from "src/stores/UserStore";
import { publicConfig } from "src/utils/config";
import styled from "styled-components";

import { UserIndicator } from "./UserIndicator";

interface ComponentProps {
  homepage?: boolean;
}

const Container = styled.header<ComponentProps>`
  display: flex;
  padding: 0 4px;
  box-shadow: ${({ theme }) => theme.token.boxShadow };
  z-index: 50;
  align-items: center;
  background-color: ${({ theme }) => theme.token.colorBgContainer};
`;

const HeaderItem = styled.div`
  padding: 0 16px;
  /* justify-content: center; */
  height: 100%;
`;

const MenuPart = styled(HeaderItem)`
  flex: 1;
  min-width: 0;
`;

const MenuPartPlaceholder = styled.div`
  flex: 1;
  @media (min-width: ${antdBreakpoints.md}px) {
    display: none;
  }
`;

const IndicatorPart = styled(HeaderItem)`
  justify-self: flex-end;
  flex-wrap: nowrap;
`;

interface Props {
  hasSidebar: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  sidebarCollapsed: boolean;
  routes?: NavItemProps[];
  user?: User;
  logout: (() => void) | undefined;
  pathname: string;
}

export const Header: React.FC<Props> = ({
  hasSidebar, routes,
  setSidebarCollapsed, sidebarCollapsed,
  user, pathname, logout,
}) => {
  return (
    <Container>
      <HeaderItem>
        <Space size="middle">
          {hasSidebar
            ? (
              <a onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
                {React.createElement(
                  sidebarCollapsed ? MenuUnfoldOutlined : MenuFoldOutlined)}
              </a>
            ) : undefined
          }
          <Logo />
        </Space>
      </HeaderItem>
      <MenuPart>
        <BigScreenMenu
          pathname={pathname}
          routes={routes}
        />
        <MenuPartPlaceholder />
      </MenuPart>
      <DefaultClusterSelector />
      {
        publicConfig.PORTAL_URL ? (
          <HeaderItem>
            {/* Cannot use Link because links adds BASE_PATH, but MIS_URL already contains it */}
            <Typography.Link href={user
              ? join(publicConfig.PORTAL_URL, "/api/auth/callback?token=" + user.token)
              : publicConfig.PORTAL_URL}
            >
              <ArrowRightOutlined /> 门户
            </Typography.Link>
          </HeaderItem>
        ) : undefined
      }
      <IndicatorPart>
        <UserIndicator user={user} logout={logout} />
      </IndicatorPart>
    </Container>
  );
};
