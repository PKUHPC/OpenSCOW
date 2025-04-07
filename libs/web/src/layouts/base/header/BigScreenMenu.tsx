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
import { Menu } from "antd";
import React from "react";
import { createMenuItems } from "src/layouts/base/common";
import { antdBreakpoints } from "src/layouts/base/constants";
import { NavItemProps } from "src/layouts/base/types";
import { styled } from "styled-components";

const Container = styled.div`
  @media (max-width: ${antdBreakpoints.md}px) {
    display: none;
  }

  width: 100%;
  .ant-menu-item-icon svg{
    font-size:1.42em;
  }

  .anticon img{
    font-size:1.42em;
  }

  .ant-menu-title-content{
    position:relative;
    bottom:0.2em;
  }
`;

interface Props {
  routes?: NavItemProps[];
  className?: string;
  pathname: string;
  activeKeys: string[];
}

export const BigScreenMenu: React.FC<Props> = ({
  routes, className, activeKeys, pathname,
}) => {

  return (
    <Container className={className}>
      {
        arrayContainsElement(routes)
          ? (
            <Menu
              style={{ minWidth: 0, flex: "auto", border: 0 }}
              theme="light"
              mode="horizontal"
              selectedKeys={activeKeys}
              items={createMenuItems(routes, pathname, true)}
            />
          ) : undefined
      }
    </Container>
  );
};
