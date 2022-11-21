import { ArrowRightOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { Space } from "antd";
import { join } from "path";
import React from "react";
import { useStore } from "simstate";
import { SingleClusterSelector } from "src/components/ClusterSelector";
import { BigScreenMenu } from "src/layouts/header/BigScreenMenu";
import { Logo } from "src/layouts/header/Logo";
import { NavItemProps } from "src/layouts/NavItemProps";
import { DefaultClusterStore } from "src/stores/DefaultClusterStore";
import { UserStore } from "src/stores/UserStore";
import { antdBreakpoints } from "src/styles/constants";
import { publicConfig } from "src/utils/config";
import styled from "styled-components";

import { UserIndicator } from "./UserIndicator";

interface ComponentProps {
  homepage?: boolean;
}

const Container = styled.header<ComponentProps>`
  display: flex;
  padding: 0 4px;
  box-shadow: 0 2px 8px #f0f1f2;
  z-index: 50;
  align-items: center;
`;

const HeaderItem = styled.div`
  padding: 0 16px;
  /* justify-content: center; */
  height: 100%;
`;

const MenuPart = styled(HeaderItem)`
  flex: 1;
  width: 100%;
`;

const ResponsiveBigScreenMenu = styled(BigScreenMenu)`
  @media (max-width: ${antdBreakpoints.md}px) {
    display: none;
  }
`;

const MenuPartPlaceholder = styled.div`
  flex: 1;
  @media (min-width: ${antdBreakpoints.md}px) {
    display: none;
  }
`;

const IndicatorPart = styled(HeaderItem)`
  flex-wrap: nowrap;
`;

interface Props {
  navigate: (path: string) => void;
  hasSidebar: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  sidebarCollapsed: boolean;
  routes?: NavItemProps[];
  pathname: string;
}

export const Header: React.FC<Props> = ({
  hasSidebar, routes, pathname,
  setSidebarCollapsed, sidebarCollapsed,
}) => {

  const userStore = useStore(UserStore);

  const defaultClusterStore = useStore(DefaultClusterStore);

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
        <ResponsiveBigScreenMenu
          pathname={pathname}
          routes={routes}
        />
        <MenuPartPlaceholder />
      </MenuPart>
      <SingleClusterSelector 
        value={defaultClusterStore.cluster} 
        onChange={(cluster) => {
          defaultClusterStore.setCluster(cluster);
        }} 
      />
      {

        publicConfig.MIS_URL ? (
          <HeaderItem>
            <a href={
              userStore.user
                ? join(publicConfig.MIS_URL, "/api/auth/callback?token=" + userStore.user?.token)
                : publicConfig.MIS_URL
            }
            >
              <ArrowRightOutlined /> 管理系统
            </a>
          </HeaderItem>
        ) : undefined
      }
      <IndicatorPart>
        <UserIndicator />
      </IndicatorPart>
    </Container>
  );
};
