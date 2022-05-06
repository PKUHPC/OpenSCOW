import { Menu } from "antd";
import Link from "next/link";
import Router from "next/router";
import React from "react";
import { match } from "src/layouts/matchers";
import { NavItemProps } from "src/layouts/NavItemProps";
import { iconToNode } from "src/layouts/routes";
import { arrayContainsElement } from "src/utils/array";

export const renderLogoutLink = (logout: () => void) => (
  <Menu.Item key="logout">
    <Link href="/">
      <a onClick={logout}>
        退出登录
      </a>
    </Link>
  </Menu.Item>
);


export function createMenuItems(
  routes: NavItemProps[],
  parentClickable: boolean,
) {
  function createMenuItem(route: NavItemProps) {

    if (arrayContainsElement(route.children)) {
      return (
        <Menu.SubMenu
          key={route.path}
          icon={iconToNode(route.Icon)}
          onTitleClick={(route.clickable ?? parentClickable)
            ? () => Router.push(route.clickToPath ?? route.path)
            : undefined}
          title={route.text}
        >
          {createMenuItems(route.children, parentClickable)}
        </Menu.SubMenu>
      );
    }


    return (
      <Menu.Item
        key={route.path}
        icon={iconToNode(route.Icon)}
      >
        <Link href={route.clickToPath ?? route.path}>
          <a {...route.extraLinkProps}>
            {route.text}
          </a>
        </Link>
      </Menu.Item>
    );
  }
  const items = routes.map((r) => createMenuItem(r));

  return items;
}

export function calcSelectedKeys(links: NavItemProps[], pathname: string) {

  return links.reduce((prev, curr) => {
    if (arrayContainsElement(curr.children)) {
      prev.push(...calcSelectedKeys(curr.children, pathname));
    }
    if (
      (curr.path === "/" && pathname === "/") ||
        (curr.path !== "/" && match(curr, pathname))
    ) {
      prev.push(curr.path);
    }

    return prev;
  }, [] as string[]);
}
