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

import { join } from "path";
import { Logger } from "ts-log";

import { applicationJsonHeaders } from "./utils";

export async function checkPassword(
  authUrl: string,
  identityId: string,
  password: string,
  logger?: Logger,
) {
  const query = new URLSearchParams([["identityId", identityId], ["password", password]]);
  const url = join(authUrl, "/checkPassword") + "?" + query.toString();
  const resp = await fetch(url, {
    method: "GET",
    headers: applicationJsonHeaders,
  });

  const body = await resp.json() as { success: boolean }; 

  if (resp.status !== 200) {
    logger?.warn("Check password failed. Status code %s. body: %s", resp.status, body);
    return;
  }

  logger?.trace("Check password successful. identityId %s", body.success);

  return body;
}