import { MenuOutlined } from "@ant-design/icons";
import { Button, Dropdown, Menu } from "antd";
import { ItemType } from "antd/lib/menu/hooks/useItems";
import Link from "next/link";
import React from "react";
import { useStore } from "simstate";
import { createMenuItems } from "src/layouts/common";
import { NavItemProps } from "src/layouts/NavItemProps";
import { UserStore } from "src/stores/UserStore";
import { arrayContainsElement } from "src/utils/array";
import styled from "styled-components";

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

  const items = [] as ItemType[];

  if (arrayContainsElement(routes)) {
    items.push(...createMenuItems(routes, true));
    items.push({ type: "divider" });
  }

  if (userStore.user) {
    items.push({ disabled: true, key: "user-info", label: `欢迎，${userStore.user.identityId}` });
    items.push({ key: "logout", label: (
      <Link href="/">
        <a onClick={userStore.logout}>
        退出登录
        </a>
      </Link>
    ) });
  }

  return (
    <Container>
      <Dropdown
        placement="bottomRight"
        overlay={<Menu items={items} />}
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
