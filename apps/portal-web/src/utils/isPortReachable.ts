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

import * as http from "http";
import net from "net";

// https://github.com/sindresorhus/is-port-reachable

export async function isPortReachable(
  port: number, 
  host: string,
  timeout: number = 1000,
  proxyPort?: number,
  proxyHost?: string,
): Promise<boolean> {

  // 【test】
  if (proxyPort && proxyHost) {
    // 检验到代理网关节点是否可达
    const proxyPortReachable = directIsPortReachable(proxyPort, proxyHost, timeout);
    console.log("【proxyPortReachable】", proxyPortReachable);
    // 检验代理网关节点到计算节点的主机和端口是否可达
    const reachableThroughProxy = isReachableThroughProxy(host, port, proxyHost, proxyPort, timeout);
    console.log("【reachableThroughProxy】", reachableThroughProxy);
  } 
  
  return directIsPortReachable(port, host, timeout);

}

// check port reachable
export async function directIsPortReachable(
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

// check port reachable through Proxy
async function isReachableThroughProxy(
  targetHost: string,
  targetPort: number,
  proxyHost: string,
  proxyPort: number,
  timeout: number,
): Promise<boolean> {
  const promise = new Promise<void>((resolve, reject) => {
    const requestOptions = {
      host: proxyHost,
      port: proxyPort,
      method: "CONNECT",
      path: `${targetHost}:${targetPort}`,
      timeout,
    };

    console.log("【proxy-request-options】", requestOptions);

    const req = http.request(requestOptions);
    console.log("【【【req】】】");
    console.dir(req, { depth: null });

    req.on("connect", (res, socket) => {
      
      console.log("【【【res】】】");
      console.dir(res, { depth: null });

      if (res.statusCode === 200) {
        socket.destroy();
        resolve();
      } else {
        socket.destroy();
        reject(new Error(`Proxy connection failed with status code ${res.statusCode}`));
      }
    });

    req.on("error", (err) => {
      reject(new Error(`Request error: ${err.message}`));
    });
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Request timed out"));
    });

    req.end();
  });

  try {
    await promise;
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}