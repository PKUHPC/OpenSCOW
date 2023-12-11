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

import { Grid, Layout } from "antd";
import { usePathname } from "next/navigation";
import React, { Dispatch, PropsWithChildren, SetStateAction, useMemo, useState } from "react";
import { Header } from "src/layouts/base/header";
import { match } from "src/layouts/base/matchers";
import { NavItemProps } from "src/layouts/base/NavItemProps";
import { SideNav } from "src/layouts/base/SideNav";
import { Footer } from "src/layouts/Footer";
import { arrayContainsElement } from "src/utils/array";
import { styled } from "styled-components";

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
  routes?: NavItemProps[];
  selectedResourceId?: number;
  setSelectedResourceId?: Dispatch<SetStateAction<number>>;
}>;

export const BaseLayout: React.FC<PropsWithChildren<Props>> = ({
  routes = [], children,
  selectedResourceId = 0, setSelectedResourceId = () => {},
}) => {
  const pathname = usePathname() ?? "";

  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  // get the first level route
  const firstLevelRoute = useMemo(() => routes.find((x) => match(x, pathname)), [routes, pathname]);

  const { md } = useBreakpoint();

  const sidebarRoutes = md ? firstLevelRoute?.children : routes;

  const hasSidebar = arrayContainsElement(sidebarRoutes);

  return (
    <Root>
      <Header
        setSidebarCollapsed={setSidebarCollapsed}
        pathname={pathname}
        sidebarCollapsed={sidebarCollapsed}
        hasSidebar={hasSidebar}
        routes={routes}
        selectedResourceId={selectedResourceId}
        setSelectedResourceId={setSelectedResourceId}
      />
      <StyledLayout>
        {
          (hasSidebar) ? (
            <SideNav
              pathname={pathname}
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
          <Footer />
        </ContentPart>
      </StyledLayout>
    </Root>
  );
};

