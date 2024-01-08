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

import { aiConfig } from "src/server/config/ai";
import { config } from "src/server/config/env";


async function getCsrfToken() {
  const logoutUrl = `${config.PROTOCOL || "http"}://${aiConfig.harborConfig.url}/c/log_out`;
  const response = await fetch(logoutUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "user-agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko)" +
       "Chrome/113.0.0.0 Mobile Safari/537.36",
    },
  });

  const csrfToken = response.headers.get("X-Harbor-Csrf-Token") || "";
  const cookies = response.headers.get("set-cookie") || "";

  return { csrfToken, cookies };
}

export async function loginToHarbor() {
  const { csrfToken, cookies } = await getCsrfToken();
  const loginUrl = `${config.PROTOCOL || "http"}://${aiConfig.harborConfig.url}/c/login`;

  const response = await fetch(loginUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cookie": cookies,
      "X-Harbor-CSRF-Token": csrfToken,
      "user-agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko)" +
       "Chrome/113.0.0.0 Mobile Safari/537.36",
    },
    body: JSON.stringify({ principal: aiConfig.harborConfig.user, password: aiConfig.harborConfig.password }),
  });

  if (!response.ok) {
    throw new Error("Login to harbor failed: " + response.text);
  }

  return response.headers.get("x-harbor-csrf-token");
}
