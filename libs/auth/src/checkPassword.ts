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

import { applicationJsonHeaders, logHttpErrorAndThrow } from "./utils";

/**
 * Check the password is correct
 * @param authUrl the url for auth service
 * @param params the API parameters
 * @returns { success: boolean }
 */
export async function checkPassword(
  authUrl: string,
  params: { identityId: string, password: string },
  logger?: Logger,
): Promise<{ success: boolean } | undefined> {

  const query = new URLSearchParams([["identityId", params.identityId], ["password", params.password]]);
  const url = join(authUrl, "/checkPassword") + "?" + query.toString();
  const resp = await fetch(url, {
    method: "GET",
    headers: applicationJsonHeaders,
  });

  if (resp.status === 200) {
    return { success: (await resp.json()).result };
  } else if (resp.status === 404) {
    const json = await resp.json().catch(() => undefined);
    if (json?.code === "USER_NOT_FOUND") {
      return undefined;
    } else {
      logHttpErrorAndThrow(resp, logger);
    }
  } else {
    logHttpErrorAndThrow(resp, logger);
  }
}
