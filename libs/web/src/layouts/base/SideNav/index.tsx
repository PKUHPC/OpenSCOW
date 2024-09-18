/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * OpenSCOW is licensed under Mulan PSL v2.
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
import { Layout, Menu } from "antd";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createMenuItems } from "src/layouts/base/common";
import { antdBreakpoints } from "src/layouts/base/constants";
import { NavItemProps } from "src/layouts/base/types";
import { styled } from "styled-components";

import BodyMask from "./BodyMask";

const { Sider } = Layout;

const breakpoint = "lg";

interface Props {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;

  routes: NavItemProps[];
  pathname: string;
  activeKeys: string[];

}

const StyledSider = styled(Sider)`

  @media (max-width: ${antdBreakpoints[breakpoint]}px ) {
    position: absolute !important;
    z-index: 1000;

    body, html {
      overflow-x: hidden;
      overflow-y: auto;
    }

    overflow: auto;
  }

  height: 100%;

  .ant-menu-item:first-child {
    margin-top: 0px;
  }

  .ant-menu {
    min-height: 100%;
    border-right: 0;
  }
`;

const Container = styled.div`
  .ant-layout-sider {
    background: initial;
  }
`;

function getAllParentKeys(routes: NavItemProps[]): string[] {
  return routes.map((x) => {
    if (arrayContainsElement(x.children)) {
      return [...getAllParentKeys(x.children), x.path];
    } else {
      return [];
    }
  }).flat();
}

export const SideNav: React.FC<Props> = ({
  collapsed, routes, setCollapsed, pathname, activeKeys,
}) => {

  const parentKeys = useMemo(() => getAllParentKeys(routes), [routes]);

  const [openKeys, setOpenKeys] = useState(parentKeys);
  const menuFocusedRef = useRef(false);

  useEffect(() => {
    /**
     * 点击菜单，收起其他展开的所有菜单，保持菜单聚焦简洁。
     * 仅在账户管理页面有效，且用户管理的账户数量超过三个
     */
    //
    menuFocusedRef.current = parentKeys.length > 3 && parentKeys[0].startsWith("/accounts");

    if (menuFocusedRef.current) setOpenKeys([parentKeys[0]]);
    else setOpenKeys(parentKeys);
  }, [parentKeys]);

  const onBreakpoint = useCallback((broken: boolean) => {
    // if broken, big to small. collapse the sidebar
    // if not, small to big, expand the sidebar
    setCollapsed(broken);
  }, [setCollapsed]);

  const onOpenChange = useCallback((keys) => {
    if (menuFocusedRef.current) {
      const latestOpenKey = keys.find((key) => !openKeys.includes(key));

      if (!parentKeys.includes(latestOpenKey)) {
        setOpenKeys(keys);
      } else {
        setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
      }
    }
    else setOpenKeys(keys);

  }, [openKeys, parentKeys]);

  // 账户管理页面，联动横向菜单栏展开相应的侧面菜单栏
  useEffect(() => {
    if (menuFocusedRef.current) {
      setOpenKeys([activeKeys[1]]);
    }
  }, [activeKeys]);

  useEffect(() => {
    if (window.innerWidth <= antdBreakpoints[breakpoint]) {
      setCollapsed(true);
    }
  }, [pathname]);

  if (!arrayContainsElement(routes)) {
    return null;
  }
  return (
    <Container>
      <BodyMask
        onClick={() => setCollapsed(true)}
        sidebarShown={!collapsed}
        breakpoint={antdBreakpoints[breakpoint]}
      />
      <StyledSider
        onBreakpoint={onBreakpoint}
        collapsed={collapsed}
        collapsedWidth={0}
        breakpoint={breakpoint}
        trigger={null}
      >
        <Menu
          mode="inline"
          selectedKeys={activeKeys}
          {
            ...collapsed
              ? undefined
              : { openKeys }
          }
          onOpenChange={onOpenChange}
          items={createMenuItems(routes, pathname, false)}
        >
        </Menu>
      </StyledSider>
    </Container>
  );
};

