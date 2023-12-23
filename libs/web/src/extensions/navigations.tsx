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

import { LinkOutlined } from "@ant-design/icons";
import { defineExtensionRoute } from "src/extensions/routes";
import { NavItemProps } from "src/layouts/base/types";
import { NavIcon } from "src/layouts/icon";
import { z } from "zod";

export const BaseNavItem = z.object({
  path: z.string({ description: "目标路径。如果是外部链接，需要以 http:// 或 https:// 开头。如果是SCOW的路径，无需加base path" }),
  clickToPath: z.string().optional(),
  text: z.string(),
  iconSrc: z.string().optional(),
  iconAlt: z.string().optional(),
  openInNewPage: z.boolean().optional(),
});

export type NavItem = z.infer<typeof BaseNavItem> & {
  children?: NavItem[];
}

export const NavItem = BaseNavItem.extend({
  children: z.lazy(() => NavItem).array().optional(),
});

export const rewriteNavigationsRoute = (from: "portal" | "mis") => defineExtensionRoute({
  path: `/${from}/rewriteNavigations`,
  method: "POST" as const,
  query: z.object({
    scowUserToken: z.string().optional(),
    scowDark: z.string(),
    scowLangId: z.string(),
  }),
  body: z.object({
    navs: z.array(NavItem) as z.ZodType<NavItem[]>,
  }),
  responses: {
    200: z.object({
      navs: z.array(NavItem) as z.ZodType<NavItem[]>,
    }),
  },
});


export const fromNavItemProps = (props: NavItemProps[]): NavItem[] => {
  return props.map((x) => ({
    path: x.path,
    clickToPath: x.clickToPath,
    text: x.text,
    openInNewPage: x.openInNewPage,
    children: x.children ? fromNavItemProps(x.children) : undefined,
  }));
};

export const toNavItemProps = (originalItems: NavItemProps[], items: NavItem[]): NavItemProps[] => {

  // create a map with original origin items paths
  const originalItemsMap = new Map<string, NavItemProps>();

  const convertToMap = (navs: NavItemProps) => {
    originalItemsMap.set(navs.path, navs);
    navs.children?.forEach(convertToMap);
  };

  originalItems.forEach(convertToMap);

  const rec = (items: NavItem[]): NavItemProps[] => {
    return items.map((item) => ({
      path: item.path,
      clickToPath: item.clickToPath,
      text: item.text,
      openInNewPage: item.openInNewPage,
      Icon: (item.iconSrc
        ? <NavIcon src={item.iconSrc} alt={item.iconAlt} />
        : originalItemsMap.get(item.path)?.Icon
      ) ?? LinkOutlined,
      handleClick: originalItemsMap.get(item.path)?.handleClick,
      children: item.children ? rec(item.children) : undefined,
    }));
  };

  return rec(items);

};
