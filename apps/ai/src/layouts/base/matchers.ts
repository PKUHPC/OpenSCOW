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

import type { NavItemProps } from "src/layouts/base/NavItemProps";

export type Matcher = (spec: string, path: string) => boolean;

const removeQuery = (path: string) => path.split("?", 1)[0];

export const exactMatch: Matcher = (spec, path) => {
  return path === spec;
};

export const startsWithMatch: Matcher = (spec, path) => {
  const normalizedPath = path.endsWith("/") ? path.substring(0, path.length - 1) : path;
  // avoid /test matches /test-test
  return normalizedPath === spec || normalizedPath.startsWith(spec + "/");
};

export const match = (item: NavItemProps, path: string) => {
  return (item.match ?? startsWithMatch)(item.path, removeQuery(path));
};
