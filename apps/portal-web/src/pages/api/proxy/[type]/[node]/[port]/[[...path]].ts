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

import { normalizePathnameWithQuery } from "@scow/utils";
import http from "http";
import httpProxy from "http-proxy";
import { NextApiRequest } from "next";
import { join } from "path";
import { checkCookie } from "src/auth/server";
import { AugmentedNextApiResponse } from "src/types/next";
import { publicConfig } from "src/utils/config";


/**
 * Parse proxy target
 * @param url req.url
 * @param urlIncludesBasePath whether url.req includes base path already
 * @returns Parsed proxy targe
 */
function parseProxyTarget(url: string, urlIncludesBasePath: boolean): string | Error {

  const normalizedUrl = normalizePathnameWithQuery(url);

  const basePath = publicConfig.BASE_PATH;

  // skip base path
  const relativePath = urlIncludesBasePath
    ? basePath === "/"
      ? normalizedUrl
      : normalizedUrl.slice(basePath.length)
    : normalizedUrl;

  const [_empty, _api, _proxy, type, node, port, ...path] = relativePath.split("/");

  if (type === "relative") {
    return `http://${node}:${port}/${path.join("/")}`;
  } else if (type === "absolute") {
    const path = `${(urlIncludesBasePath || basePath === "/") ? "" : basePath}${url}`;
    return `http://${node}:${port}${path}`;
  } else {
    return new Error("type is not absolute or relative");
  }
}

const proxy = httpProxy.createServer();

export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Node的原生http服务器（http.Server）在收到WebSocket连接的时候将会触发一个`upgrade`事件，而且并不走正常的HTTP请求响应流程
 * 所以整个系统第一次启动后，在以HTTP形式访问此代理地址之前，到本地址的WebSocket将会失败
 * 因为此时并没有注册upgrade事件的监听器，无法处理WebSocket连接。
 *
 * 所以系统启动后，需要手动触发一次到本地址的HTTP请求，以便注册upgrade事件的监听器
 */
export const setupWssProxy = (res: AugmentedNextApiResponse) => {
  const server: http.Server = res.socket.server;

  server.on("upgrade", async (req, socket, head) => {

    const url = normalizePathnameWithQuery(req.url!);

    if (!url.startsWith(join(publicConfig.BASE_PATH, "/api/proxy"))) { return; }

    const writeError = (statusLine: string, msg: string) => {
      socket.end(`HTTP/1.1 ${statusLine}\r\n${msg}`);
    };

    const user = await checkCookie(() => true, req).catch(() => {
      writeError("500 Internal Server Error", "Error when authenticating request");
      return 500;
    });

    if (typeof user === "number") {
      writeError("401 Unauthorized", "token is not valid");
      return;
    }

    // req.url of raw node.js request object doesn't remove base path
    const target = parseProxyTarget(req.url!, true);

    if (target instanceof Error) {
      writeError("400 Bad Request", target.message);
      return;
    }

    proxy.ws(req, socket, head, { target, ignorePath: true, xfwd: true }, (err) => {
      console.error(err, "Error when proxing WS requests");
      writeError("500 Internal Server Error", "Error when proxing WS requests");
    });

  });

};

export default async (req: NextApiRequest, res: AugmentedNextApiResponse) => {

  const user = await checkCookie(() => true, req).catch(() => {
    res.status(500).send("Error when authenticating request");
    return 500;
  });

  if (typeof user === "number") {
    res.status(401).send("Unauthorized");
    return;
  }

  // req.url of next.js removes base path
  const target = parseProxyTarget(req.url!, false);

  if (target instanceof Error) {
    res.status(400).send(target.message);
    return;
  }

  proxy.web(req, res, {
    target,
    ignorePath: true, xfwd: true,
  }, (err) => {
    if (err) {
      console.error(err, "Error when proxing requests");
      res.status(500).send(err);
    }
  });


};
