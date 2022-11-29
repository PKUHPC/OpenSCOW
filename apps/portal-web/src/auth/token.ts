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

import { validateToken as valToken } from "@scow/lib-auth"; 
import { USE_MOCK } from "src/apis/useMock";
import { UserInfo } from "src/models/User";
import { runtimeConfig } from "src/utils/config";

export async function validateToken(token: string | undefined): Promise<UserInfo | undefined> {

  if (process.env.NODE_ENV === "test" || USE_MOCK) {
    if (!runtimeConfig.MOCK_USER_ID) {
      throw new Error("Using mock user id but runtimeConfig.MOCK_USER_ID is not set");
    }
    return { identityId: runtimeConfig.MOCK_USER_ID };
  }

  if (!token) { return undefined; }

  const resp = await valToken(runtimeConfig.AUTH_INTERNAL_URL, token).catch(() => undefined);

  if (!resp) {
    return undefined;
  }

  return {
    identityId: resp.identityId,
  };

}

