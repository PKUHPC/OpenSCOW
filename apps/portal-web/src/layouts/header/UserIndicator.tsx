import { DownOutlined, UserOutlined } from "@ant-design/icons";
import { Dropdown, Menu } from "antd";
import Link from "next/link";
import React from "react";
import { useStore } from "simstate";
import { UserStore } from "src/stores/UserStore";
import styled from "styled-components";

interface Props {
}

const Container = styled.div`
  white-space: nowrap;
`;

export const UserIndicator: React.FC<Props> = ({
}) => {

  const userStore = useStore(UserStore);

  return (
    <Container>
      {
        userStore.user ? (
          <Dropdown
            trigger={["click"]}
            overlay={(
              <Menu>
                <Menu.Item disabled>
                    用户ID：{userStore.user.identityId}
                </Menu.Item>
                <Menu.Item>
                  <Link href="/profile">
                      个人信息
                  </Link>
                </Menu.Item>
                <Menu.Item onClick={() => userStore.logout()}>
                  登出
                </Menu.Item>
              </Menu>
            )}
          >
            <a>
              <UserOutlined />
              {userStore.user.identityId}
              <DownOutlined />
            </a>
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
