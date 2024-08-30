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

import { publicConfig } from "src/utils/config";

/**
 * 检查ShadowDesk应用是否准备就绪
 *
 * @param id - 请求中使用的ID
 * @param timeout - 每个请求的超时时间（毫秒）
 * @returns 返回一个 Promise，当检查完成时会解析为 boolean
 */
const basePath = publicConfig.BASE_PATH;

export async function isShadowDeskReachable(id: string, timeout: number = 1000): Promise<boolean> {
  if (typeof id !== "string") {
    throw new TypeError("Specify a `id`");
  }

  // 带超时的 fetch 请求
  const fetchWithTimeout = async (url: string, timeout: number): Promise<Response> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  };

  try {
    const url = `${basePath}/shadowdesk/checkConnectivity?id=${id}`;
    const response = await fetchWithTimeout(url, timeout);

    if (response.ok) {
      const result = await response.json();
      if (result.ok) {
        console.log(`ShadowDesk 应用已准备就绪，状态码：${response.status}`);
        return true;
      } else {
        console.log(`ShadowDesk 应用尚未准备好，返回值：${JSON.stringify(result)}`);
        return false;
      }
    } else {
      console.log(`连接失败，状态码：${response.status}`);
      return false;
    }
  } catch (error) {
    console.error(`连接错误：${error.message}`);
    return false;
  }
}
