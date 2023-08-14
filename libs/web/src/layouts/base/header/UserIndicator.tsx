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
import { Dropdown, Typography } from "antd";
import Link from "next/link";
import React from "react";
import { antdBreakpoints } from "src/layouts/base/constants";
import styled from "styled-components";

import { EXTERNAL_URL_PREFIX } from "../common";
import { UserInfo, UserLink } from "../types";

interface Props {
  user: UserInfo | undefined;
  logout: (() => void) | undefined;
  userLinks?: UserLink[];
}

const Container = styled.div`
  white-space: nowrap;
`;

const InlineBlockA = styled.a`
  cursor: pointer;
  line-height: 45px;
  display: inline-block;
`;

const HiddenOnSmallScreen = styled.span`
  @media (max-width: ${antdBreakpoints.md}px) {
    display: none;
  }
`;

export const UserIndicator: React.FC<Props> = ({
  user, logout, userLinks,
}) => {

  return (
    <Container>
      {
        user ? (
          <Dropdown
            trigger={["click"]}
            menu={{
              items: [
                ...user.name ? [{ key: "username", disabled: true, label: `用户姓名：${user.name}` }] : [],
                { key: "userid", disabled: true, label: `用户ID：${user.identityId}` },
                { key: "profileLink", label: <Link href="/profile">个人信息</Link> },
                ...userLinks ? userLinks.map((link) => {
                  return ({
                    key: link.text,
                    label: EXTERNAL_URL_PREFIX.some((pref) => link.url.startsWith(pref)) ? <Typography.Link
                      href={`${link.url}?token=${user.token}`}
                      target={link.openInNewPage ? "_blank" : "_self"}
                    >{link.text}</Typography.Link> : <Link
                      href={`${link.url}?token=${user.token}`}
                      target={link.openInNewPage ? "_blank" : "_self"}
                    >{link.text}</Link>,
                  });
                }) : [],
                { key: "logout", onClick: logout, label: "退出登录" },
              ],
            }}
          >
            <InlineBlockA>
              <UserOutlined />
              <HiddenOnSmallScreen>
                {user.name ?? user.identityId}
              </HiddenOnSmallScreen>
              <DownOutlined />
            </InlineBlockA>
          </Dropdown>
        ) : (
          <Link href="/api/auth">
            登录
          </Link>
        )
      }
    </Container>
  );
};
