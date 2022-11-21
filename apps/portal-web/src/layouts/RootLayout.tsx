import { Layout } from "antd";
import useBreakpoint from "antd/lib/grid/hooks/useBreakpoint";
import { useRouter } from "next/router";
import React, { PropsWithChildren, useMemo, useState } from "react";
import { useStore } from "simstate";
import { Footer } from "src/layouts/Footer";
import { Header } from "src/layouts/header";
import { match } from "src/layouts/matchers";
import { userRoutes } from "src/layouts/routes";
import { SideNav } from "src/layouts/SideNav";
import { DefaultClusterStore } from "src/stores/DefaultClusterStore";
import { arrayContainsElement } from "src/utils/array";
import styled from "styled-components";
// import logo from "src/assets/logo-no-text.svg";


type Props = PropsWithChildren<{
  footerText: string;
}>;

const Root = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const ContentPart = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow-x: scroll;
`;

const Content = styled(Layout.Content)`
  margin: 8px;
  padding: 16px;
  flex: 1;
  background: white;
`;

const StyledLayout = styled(Layout)`
`;


export const RootLayout: React.FC<Props> = ({ footerText, children }) => {
  const defaultClusterStore = useStore(DefaultClusterStore);

  const allRoutes = useMemo(userRoutes, [defaultClusterStore.cluster]);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  const router = useRouter();

  // get the first level route
  const firstLevelRoute = allRoutes.find((x) => match(x, router.pathname));

  const { md } = useBreakpoint();

  const sidebarRoutes = md ? firstLevelRoute?.children : allRoutes;

  const hasSidebar = arrayContainsElement(sidebarRoutes);

  return (
    <Root>
      <Header
        pathname={router.asPath}
        navigate={router.push}
        setSidebarCollapsed={setSidebarCollapsed}
        sidebarCollapsed={sidebarCollapsed}
        hasSidebar={hasSidebar}
        routes={allRoutes}
      />
      <StyledLayout>
        {
          hasSidebar ? (
            <SideNav
              pathname={router.asPath}
              navigate={router.push}
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
