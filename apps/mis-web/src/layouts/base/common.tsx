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

import { ItemType } from "antd/es/menu/hooks/useItems";
import Link from "next/link";
import Router from "next/router";
import { match } from "src/layouts/base/matchers";
import { NavItemProps } from "src/layouts/base/NavItemProps";
import { iconToNode } from "src/layouts/routes";
import { arrayContainsElement } from "src/utils/array";

export function createMenuItems(
  routes: NavItemProps[],
  parentClickable: boolean,
) {

  function createMenuItem(route: NavItemProps): ItemType {
    if (arrayContainsElement(route.children)) {
      return {
        icon: iconToNode(route.Icon),
        key: route.path,
        title: route.text,
        label: route.text,
        onTitleClick:(route.clickable ?? parentClickable)
          ? () => {
            const target = route.clickToPath ?? route.path;
            if (route.openInNewPage) {
              window.open(target);
            } else {
              Router.push(target);
            }
          }
          : undefined,
        children: createMenuItems(route.children, parentClickable),
      } as ItemType;
    }

    return {
      icon: iconToNode(route.Icon),
      key: route.path,
      label: (
        <Link href={route.clickToPath ?? route.path} {...route.openInNewPage ? { target: "_blank" } : {}}>
          {route.text}
        </Link>
      ),
    } as ItemType;
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
