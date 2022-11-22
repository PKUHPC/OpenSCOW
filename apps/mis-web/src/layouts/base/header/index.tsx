import { ArrowRightOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { Space, Typography } from "antd";
import Link from "next/link";
import { join } from "path";
import React from "react";
import { antdBreakpoints } from "src/layouts/base/constants";
import { BigScreenMenu } from "src/layouts/base/header/BigScreenMenu";
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
      {
        publicConfig.PORTAL_URL ? (
          <HeaderItem>
            <Link
              href={
                user
                  ? join(publicConfig.PORTAL_URL, "/api/auth/callback?token=" + user.token)
                  : publicConfig.PORTAL_URL
              }
              legacyBehavior
            >
              <Typography.Link>
                <ArrowRightOutlined /> 门户
              </Typography.Link>
            </Link>
          </HeaderItem>
        ) : undefined
      }
      <IndicatorPart>
        <UserIndicator user={user} logout={logout} />
      </IndicatorPart>
    </Container>
  );
};
