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

import { arrayContainsElement } from "@scow/utils";
import { Grid, Layout } from "antd";
import { useRouter } from "next/router";
import React, { PropsWithChildren, useState } from "react";
import { Footer } from "src/layouts/base/Footer";
import { Header } from "src/layouts/base/header";
import { match } from "src/layouts/base/matchers";
import { SideNav } from "src/layouts/base/SideNav";
import { NavItemProps, UserInfo } from "src/layouts/base/types";
import styled from "styled-components";
// import logo from "src/assets/logo-no-text.svg";
const { useBreakpoint } = Grid;

const Root = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const ContentPart = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  width: 100%;
  overflow: hidden;
`;

const Content = styled(Layout.Content)`
  margin: 8px;
  padding: 16px;
  flex: 1;
  background: ${({ theme }) => theme.token.colorBgLayout};
`;

const StyledLayout = styled(Layout)`
  position: relative;
`;

type Props = PropsWithChildren<{
  footerText: string;
  versionTag: string | undefined;
  routes: NavItemProps[];
  logout: (() => void) | undefined;
  user: UserInfo | undefined;
  headerRightContent?: React.ReactNode;
  basePath: string;
}>;

export const BaseLayout: React.FC<PropsWithChildren<Props>> = ({
  children, footerText, versionTag, routes, user, logout,
  headerRightContent, basePath,
}) => {

  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  const router = useRouter();

  // get the first level route
  const firstLevelRoute = routes.find((x) => match(x, router.asPath));

  const { md } = useBreakpoint();

  const sidebarRoutes = md ? firstLevelRoute?.children : routes;

  const hasSidebar = arrayContainsElement(sidebarRoutes);

  return (
    <Root>
      <Header
        setSidebarCollapsed={setSidebarCollapsed}
        pathname={router.asPath}
        sidebarCollapsed={sidebarCollapsed}
        hasSidebar={hasSidebar}
        routes={routes}
        user={user}
        logout={logout}
        right={headerRightContent}
        basePath={basePath}
      />
      <StyledLayout>
        {
          hasSidebar ? (
            <SideNav
              pathname={router.asPath}
              collapsed={sidebarCollapsed}
              routes={sidebarRoutes}
              setCollapsed={setSidebarCollapsed}
            />
          ) : undefined
        }
        <ContentPart>
          <Content>
            {children}
          </Content>
          <Footer text={footerText} versionTag={versionTag}/>
        </ContentPart>
      </StyledLayout>
    </Root>
  );
};

