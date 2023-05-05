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

import { Logger } from "ts-log";

export interface UserInfo {
  identityId: string;
}

export async function validateToken(authUrl: string, token: string, logger?: Logger): Promise<UserInfo | undefined> {
  const resp = await fetch(authUrl + "/public/validateToken?token=" + token, {
    method: "GET",
  });

  const body = await resp.json() as UserInfo;

  if (resp.status !== 200) {
    logger?.warn("Validation token failed. Status code %s. body: %s", resp.status, body);
    return;
  }

  logger?.trace("Validate token successful. identityId %s", body.identityId);

  return body;
}
