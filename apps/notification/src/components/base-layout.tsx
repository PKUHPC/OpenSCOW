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

import { Layout } from "antd";
import { usePathname } from "next/navigation";
import React, { PropsWithChildren, useState } from "react";
import { NavItemProps } from "src/layouts/base/NavItemProps";
import { SideNav } from "src/layouts/base/SideNav";
import { arrayContainsElement } from "src/utils/array";
import { styled } from "styled-components";

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

interface Props {
  sidebarRoutes: NavItemProps[];
}
export const BaseLayout: React.FC<PropsWithChildren<Props>> = ({ sidebarRoutes, children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  const pathname = usePathname() ?? "";


  const hasSidebar = arrayContainsElement(sidebarRoutes);

  return (
    <div>
      <StyledLayout>
        {
          hasSidebar && (
            <SideNav
              pathname={pathname}
              collapsed={sidebarCollapsed}
              routes={sidebarRoutes}
              setCollapsed={setSidebarCollapsed}
            />
          )
        }
        <ContentPart>
          <Content>
            {children}
          </Content>
        </ContentPart>
      </StyledLayout>
    </div>
  );
};

