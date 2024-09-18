/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * OpenSCOW is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import { normalize } from "path";

export const toHref = ({ pathname = "", query }: { pathname?: string, query?: Record<string, string> }) => {

  if (!query) { return pathname; }

  const search = new URLSearchParams(query).toString();

  return pathname + (search ? "?" + search : "");


};


/**
 * Normalize pathname with query
 * @param pathnameWithQuery pathname possibly with query
 * @returns normalized pathname
 */
export function normalizePathnameWithQuery(pathnameWithQuery: string) {
  // strip querystring
  const qsIndex = pathnameWithQuery.indexOf("?");

  const pathname = pathnameWithQuery.slice(0, qsIndex === -1 ? undefined : qsIndex);
  const qs = qsIndex === -1 ? "" : pathnameWithQuery.slice(qsIndex);

  return normalize(pathname) + qs;
}

export const createQueryString = (name: string, value: string) => {
  const params = new URLSearchParams();
  params.set(name, value);

  return params.toString();
};
