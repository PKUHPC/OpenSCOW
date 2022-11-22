"use client";

import { Grid, Layout } from "antd";
import { useRouter } from "next/router";
import React, { PropsWithChildren, useMemo, useState } from "react";
import { useStore } from "simstate";
import { Footer } from "src/layouts/base/Footer";
import { Header } from "src/layouts/base/header";
import { match } from "src/layouts/base/matchers";
import { SideNav } from "src/layouts/base/SideNav";
import { userRoutes } from "src/layouts/routes";
import { UserStore } from "src/stores/UserStore";
import { arrayContainsElement } from "src/utils/array";
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
  overflow-x: scroll;
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
}>;

export const BaseLayout: React.FC<PropsWithChildren<Props>> = ({ children, footerText }) => {

  const userStore = useStore(UserStore);

  const allRoutes = useMemo(() => userRoutes(), []);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  const router = useRouter();

  const logout = () => {
    userStore.logout();
  };

  // get the first level route
  const firstLevelRoute = allRoutes.find((x) => match(x, router.asPath));

  const { md } = useBreakpoint();

  const sidebarRoutes = md ? firstLevelRoute?.children : allRoutes;

  const hasSidebar = arrayContainsElement(sidebarRoutes);

  return (
    <Root>
      <Header
        setSidebarCollapsed={setSidebarCollapsed}
        pathname={router.asPath}
        sidebarCollapsed={sidebarCollapsed}
        hasSidebar={hasSidebar}
        routes={allRoutes}
        user={userStore.user}
        logout={logout}
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
          <Footer text={footerText} />
        </ContentPart>
      </StyledLayout>
    </Root>
  );
};

