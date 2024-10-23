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

import crypto from "crypto";
import http from "http";
import net from "net";
import { NextApiRequest } from "next";
import { join } from "path";

import { publicConfig } from "./config";

// https://github.com/sindresorhus/is-port-reachable
export async function isPortReachable(
  port: number, 
  host: string,
  timeout: number = 1000,
): Promise<boolean> {
  if (typeof host !== "string") {
    throw new TypeError("Specify a `host`");
  }

  const promise = new Promise<void>((resolve, reject) => {
    const socket = new net.Socket();

    const onError = (error: Error) => {
      socket.destroy();
      reject(error);
    };

    socket.setTimeout(timeout);
    socket.once("error", onError);
    socket.once("timeout", onError);

    socket.connect(port, host, () => {
      socket.end();
      resolve();
    });
  });

  try {
    await promise;
    return true;
  } catch {
    return false;
  }
}


// check port reachable through url
export async function isPortReachableThroughUrl(
  req: NextApiRequest,
  timeout: number,
  clusterId: string,
  host: string,
  port: number,
  appType: "web" | "vnc",
  proxyType: "relative" | "absolute" | undefined,
): Promise<boolean> {

  if (typeof host !== "string") {
    throw new TypeError("Specify a `host`");
  }
  
  let timeoutId: NodeJS.Timeout | null = null;
  let controller: AbortController | null = null;

  const urlBase = `http://localhost:${process.env.PORT ?? 3000}`;
  
  try {
    // 如果是 web应 用，判断到端口的连接是否会502报错
    // 502以外认为端口已经开放
    // proxyType需要严格一致
    if (appType === "web") {

      if (typeof proxyType !== "string") {
        throw new TypeError("Specify a `proxyType` in web app");
      }
     
      controller = new AbortController();
      const { signal } = controller;
      timeoutId = setTimeout(() => controller?.abort(), timeout);

      const webPath = join(publicConfig.BASE_PATH, "/api/proxy", clusterId, proxyType, host, String(port));
  
      const checkUrl = new URL(webPath, urlBase);
      let res: Response | void;
      try {
        res = await fetch(checkUrl, {
          headers: {
            "Cookie": req.headers.cookie || "",
          },
          redirect: "manual",
          signal,
        });
      } catch (err) {
        // 如果fetch请求被中止,推测为网关报错
        // 实际测试时 不配置代理网关的情况，指定错误节点时会出现此报错
        if (err instanceof DOMException && err.name === "AbortError") {
          res = new Response(null, { status: 502 });
        } else {
          throw err;
        }
      };
  
      if (res.status === 502) {
        console.log(`Web app connection failed during connecting to ${host}:${port}`); 
        clearTimeout(timeoutId);
        controller?.abort();
        return false;
      // res.status !== 502的情况，认为端口已经开放
      } else {
        console.log(`Web app is successfully connected to ${host}:${port} with statusCode: ${res?.status}`);
        clearTimeout(timeoutId);
        controller?.abort();
        return true;
      } 

    // 如果是vnc应用，使用 http 模块检查 websocket 请求连接
    // 如果可以监听到 upgrade, 认为 http 已经接收到 websocket 升级协议，允许进一步处理，认为这种情况 vnc 应用端口已经开放
    // 需要传递必要的请求头信息
    } else {    

      // vnc的proxyType指定为absolute
      const vncPath = join(publicConfig.BASE_PATH, "/api/proxy", clusterId, "absolute", host, String(port));
      const checkUrl = new URL(vncPath, urlBase);
  
      const headerOption = {
        "Sec-WebSocket-Key": crypto.randomBytes(16).toString("base64"),
        "Sec-WebSocket-Version": 13,
        "Connection": "Upgrade",
        "Upgrade": "websocket",
        "Cookie": req.headers.cookie,
        "Host": `localhost:${process.env.PORT ?? 3000}`,
        "Origin": `http://localhost:${process.env.PORT ?? 3000}`,
      };
  
      return new Promise((resolve) => {
  
        const request = http.get(checkUrl, { headers: headerOption });
  
        request.on("upgrade", () => {
          resolve(true);
        });
  
        request.on("response", (res) => {
          console.log(
            `Vnc app connection failed during connecting to ${host}:${port} with statusCode: ${res.statusCode}`);
          resolve(false);
        });
  
        request.setTimeout(timeout, () => {
          console.log(`Timeout during vnc app connecting to ${host}:${port}`);
          request.destroy(); 
          resolve(false);
        });
  
        request.on("error", (error) => {
          console.log(`Vnc app connection failed during connecting to ${host}:${port}`, error);
          resolve(false);
        });
  
      });
  
    }
  
  } catch (error) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  
    if (error.name === "AbortError") {
      console.log(`Timeout during web app connecting to ${host}:${port}`);
    } else {
      console.log(`Error in app connection during connecting to ${host}:${port}:`, error);
    }
    controller?.abort();
    return false;
  }
  
}