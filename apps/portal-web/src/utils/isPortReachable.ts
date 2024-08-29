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

import net from "net";

// https://github.com/sindresorhus/is-port-reachable

export async function isPortReachable(
  port: number, 
  host: string,
  timeout: number = 1000,
  proxyPort?: number,
  proxyHost?: string,
): Promise<boolean> {

  if (proxyPort && proxyHost) {
    // 检验到代理网关节点是否可达
    const proxyPortReachable = await directIsPortReachable(proxyPort, proxyHost, timeout);
    if (!proxyPortReachable) return false;
    // 检验代理网关节点到计算节点的主机和端口是否可达
    const reachableThroughProxy = await isReachableThroughProxy(host, port, proxyHost, proxyPort, timeout);

    return reachableThroughProxy;
  } else {
    return await directIsPortReachable(port, host, timeout);
  }
  
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
    const proxySocket = new net.Socket();

    const onError = (err: Error) => {
      console.error("Error in proxy connection:", err.message);
      proxySocket.destroy();
      reject(err);
    };

    proxySocket.setTimeout(timeout);
    proxySocket.once("error", onError);
    proxySocket.once("timeout", () => onError(new Error("Connection timed out")));

    // 连接到代理服务器
    proxySocket.connect(proxyPort, proxyHost, () => {
      console.log(`Connected to proxy server ${proxyHost}:${proxyPort}`);

      // 此时代理服务器应该配置为直接转发TCP流量到目标主机和端口
      // 直接通过代理服务器的 socket 连接到目标主机和端口
      // 无需额外的 HTTP 请求头或协议
      proxySocket.connect(targetPort, targetHost, () => {
        console.log(`Successfully connected to ${targetHost}:${targetPort} through proxy.`);
        proxySocket.end();
        resolve();
      });
    });
  });

  try {
    await promise;
    return true;
  } catch (err) {
    console.error("Error in proxy connection:", err);
    return false;
  }
}