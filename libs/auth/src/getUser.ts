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
import { applicationJsonHeaders, logHttpErrorAndThrow } from "src/utils";
import { Logger } from "ts-log";

export interface AuthUserInfo {
  identityId: string;
  name?: string;
  mail?: string;
}

/**
 * Get user info
 * @param authUrl the url for auth service
 * @param params the API parameters
 * @returns the user info. undefined if user do not exist
 */
export async function getUser(
  authUrl: string,
  params: { identityId: string },
  logger?: Logger,
): Promise<AuthUserInfo | undefined> {

  const query = new URLSearchParams([["identityId", params.identityId]]);
  const url = join(authUrl, "/user") + "?" + query.toString();
  const resp = await fetch(url, {
    headers: applicationJsonHeaders,
  });

  if (resp.status === 200) {
    return (await resp.json()).user;
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
