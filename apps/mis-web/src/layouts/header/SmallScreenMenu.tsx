import { MenuOutlined } from "@ant-design/icons";
import { Button, Dropdown, Menu } from "antd";
import React from "react";
import { useStore } from "simstate";
import { NavItemProps } from "src/layouts/NavItemProps";
import { UserStore } from "src/stores/UserStore";
import { arrayContainsElement } from "src/utils/array";
import styled from "styled-components";

import { createMenuItems, renderLogoutLink } from "../common";

interface Props {
  pathname: string;
  routes?: NavItemProps[];
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
}) => {

  const userStore = useStore(UserStore);
  return (
    <Container>
      <Dropdown
        placement="bottomRight"
        overlay={(
          <Menu>
            {
              arrayContainsElement(routes)
                ? (
                  <>
                    {createMenuItems(routes, true)}
                    <Menu.Divider />
                  </>
                )
                : undefined
            }
            {
              userStore.user
                ? (
                  <>
                    <Menu.Item disabled>
                欢迎，{userStore.user!.name}
                    </Menu.Item>
                    {renderLogoutLink(userStore.logout)}
                  </>
                ) : (
                  <Menu.Item>
                    <a href="/api/auth">
                      登录
                    </a>
                  </Menu.Item>
                )
            }
          </Menu>
        )}
      >
        <Button type="link" style={{
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
