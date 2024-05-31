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
import React, { PropsWithChildren, useCallback, useState } from "react";
import { useAsync } from "react-async";
import { fromNavItemProps, rewriteNavigationsRoute, toNavItemProps } from "src/extensions/navigations";
import { callExtensionRoute } from "src/extensions/routes";
import { UiExtensionStoreData } from "src/extensions/UiExtensionStore";
import { Footer } from "src/layouts/base/Footer";
import { Header } from "src/layouts/base/header";
import { match } from "src/layouts/base/matchers";
import { SideNav } from "src/layouts/base/SideNav";
import { NavItemProps, UserInfo, UserLink } from "src/layouts/base/types";
import { useDarkMode } from "src/layouts/darkMode";
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
  footerText: string;
  versionTag: string | undefined;
  routes: NavItemProps[];
  logout: (() => void) | undefined;
  user: UserInfo | undefined;
  headerRightContent?: React.ReactNode;
  basePath: string;
  userLinks?: UserLink[];
  languageId: string,
  from: "portal" | "mis";
  extensionStoreData?: UiExtensionStoreData;
}>;

export const BaseLayout: React.FC<PropsWithChildren<Props>> = ({
  children, footerText, versionTag, routes, user, logout,
  headerRightContent, basePath, userLinks, languageId,
  extensionStoreData, from,
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  const router = useRouter();

  const { md } = useBreakpoint();

  const dark = useDarkMode();

  const { data: finalRoutesData } = useAsync({
    promiseFn: useCallback(async () => {
      if (!extensionStoreData) { return routes; }

      const extensions = Array.isArray(extensionStoreData)
        ? extensionStoreData
        : extensionStoreData ? [extensionStoreData] : [];

      let newRoutes = routes;

      for (const extension of extensions) {
        if (!extension.manifests[from]?.rewriteNavigations) { continue; }

        const resp = await callExtensionRoute(rewriteNavigationsRoute(from), {
          scowDark: dark.dark ? "true" : "false",
          scowLangId: languageId,
          scowUserToken: user?.token,
        }, {
          navs: fromNavItemProps(newRoutes),
        }, extension.url).catch(() => {
          console.warn("Failed to call extension rewriteNavigations.");
          return { 200: { navs: newRoutes } };
        });

        if (resp[200]) {
          newRoutes = toNavItemProps(newRoutes, resp[200].navs, extension.name);
        }
      }

      return newRoutes;
    }, [from, user, extensionStoreData, routes]),
  });

  const finalRoutes = finalRoutesData ?? routes;

  const firstLevelRoute = finalRoutes.find((x) => match(x, router.asPath));

  const sidebarRoutes = md ? firstLevelRoute?.children : finalRoutes;

  const hasSidebar = arrayContainsElement(sidebarRoutes);

  return (
    <Root>
      <Header
        setSidebarCollapsed={setSidebarCollapsed}
        pathname={router.asPath}
        sidebarCollapsed={sidebarCollapsed}
        hasSidebar={hasSidebar}
        routes={finalRoutes ?? routes}
        user={user}
        logout={logout}
        right={headerRightContent}
        basePath={basePath}
        userLinks={userLinks}
        languageId={languageId}
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

