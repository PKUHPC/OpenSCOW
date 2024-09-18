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

import { join, normalize } from "path";

const PROXY = "/api/proxy";

/**
 * Join paths to base url or pathname
 * @param base base url. can be a URL or a pathname
 * @param paths other paths
 * @returns joined url
 */
export function joinWithUrl(base: string, ...paths: string[]) {
  // strip protocol

  const protocolIndex = base.indexOf("://");

  const protocol = protocolIndex === -1 ? "" : base.slice(0, protocolIndex + "://".length);
  const noProtocol = base.slice(protocol.length);

  // strip querystring
  const qsIndex = noProtocol.indexOf("?");

  const pathname = noProtocol.slice(0, qsIndex === -1 ? undefined : qsIndex);
  const query = qsIndex === -1 ? "" : noProtocol.slice(qsIndex);

  // join pathanmes
  const joinedPathname = normalize(join(pathname, ...paths));

  return protocol + joinedPathname + query;
}


export const openDesktop = (basePath: string,
  novncClientUrl: string, clusterId: string, node: string, port: number, password: string) => {

  const params = new URLSearchParams({
    path: join(basePath, PROXY, clusterId, "absolute", node, String(port)),
    host: location.hostname,
    port: location.port,
    password: password,
    autoconnect: "true",
    reconnect: "true",
    resize: "remote",
  });

  const vncUrl = joinWithUrl(novncClientUrl, "/vnc.html");
  window.open(vncUrl + "?" + params.toString(), "_blank");
};

