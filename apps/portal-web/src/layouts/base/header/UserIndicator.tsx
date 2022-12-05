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

import { DownOutlined, UserOutlined } from "@ant-design/icons";
import { Dropdown } from "antd";
import Link from "next/link";
import React from "react";
import { ClickableA } from "src/components/ClickableA";
import { UserInfo } from "src/models/User";
import { antdBreakpoints } from "src/styles/constants";
import styled from "styled-components";

interface Props {
  user: UserInfo | undefined;
  logout: (() => void) | undefined;
}

const Container = styled.div`
  white-space: nowrap;
`;

const HiddenOnSmallScreen = styled.span`
  @media (max-width: ${antdBreakpoints.md}px) {
    display: none;
  }

`;

export const UserIndicator: React.FC<Props> = ({
  user, logout,
}) => {

  return (
    <Container>
      {
        user ? (
          <Dropdown
            trigger={["click"]}
            menu={{
              items: [
                { key: "userid", disabled: true, label: `用户ID：${user.identityId}` },
                { key: "profileLink", label: <Link href="/profile">个人信息</Link> },
                { key: "logout", onClick: logout, label: "退出登录" },
              ],
            }}
          >
            <ClickableA>
              <UserOutlined />
              <HiddenOnSmallScreen>
                {user.identityId}
              </HiddenOnSmallScreen>
              <DownOutlined />
            </ClickableA>
          </Dropdown>
        ) : (
          <Link href="/login">
            登录
          </Link>
        )
      }
    </Container>
  );
};
