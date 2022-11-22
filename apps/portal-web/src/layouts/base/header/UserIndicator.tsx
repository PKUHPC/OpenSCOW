import { DownOutlined, UserOutlined } from "@ant-design/icons";
import { Dropdown } from "antd";
import Link from "next/link";
import React from "react";
import { ClickableA } from "src/components/ClickableA";
import { UserInfo } from "src/models/User";
import styled from "styled-components";

interface Props {
  user: UserInfo | undefined;
  logout: (() => void) | undefined;
}

const Container = styled.div`
  white-space: nowrap;
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
              {user.identityId}
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
