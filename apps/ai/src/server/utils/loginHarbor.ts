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


export async function loginToHarbor(csrfToken: string) {
  const url = `${ config.PROTOCOL || "http"}://${aiConfig.harborConfig.url}/c/login`;
  console.log("loginToHarbor url", url);
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "X-Harbor-CSRF-Token": csrfToken,
    },
    body: JSON.stringify({ principal: aiConfig.harborConfig.user, password: aiConfig.harborConfig.password }),
  });

  if (!response.ok) {
    throw new Error("Login to harbor failed: " + response.statusText);
  }

  return response.headers.get("x-harbor-csrf-token");
}
