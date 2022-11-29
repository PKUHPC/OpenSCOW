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

import { MenuOutlined } from "@ant-design/icons";
import { Button, Dropdown } from "antd";
import { ItemType } from "antd/es/menu/hooks/useItems";
import Link from "next/link";
import React from "react";
import { createMenuItems } from "src/layouts/base/common";
import { NavItemProps } from "src/layouts/base/NavItemProps";
import { UserInfo } from "src/models/User";
import { arrayContainsElement } from "src/utils/array";
import styled from "styled-components";

interface Props {
  pathname: string;
  routes?: NavItemProps[];
  user: UserInfo;
  logout: () => void;
}

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
`;

export const SmallScreenMenu: React.FC<Props> = ({
  pathname,
  routes,
  user, logout,
}) => {

  const items = [] as ItemType[];

  if (arrayContainsElement(routes)) {
    items.push(...createMenuItems(routes, true));
    items.push({ type: "divider" });
  }

  items.push({ disabled: true, key: "user-info", label: `欢迎，${user.name}` });
  items.push({ key: "logout", label: (
    <Link href="/" onClick={logout}>
      退出登录
    </Link>
  ) });

  return (
    <Container>
      <Dropdown
        placement="bottomRight"
        menu={{
          style: { minWidth: 0, flex: "auto" },
          items,
        }}
      >
        <Button
          type="link"
          style={{
            height: "100%",
            color: pathname === "/" ? "white" : "black",
          }}
        >
          <MenuOutlined />
        </Button>
      </Dropdown>
    </Container>
  );
};
