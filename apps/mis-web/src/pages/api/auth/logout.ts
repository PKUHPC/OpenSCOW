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

import { jsonFetch, route } from "@ddadaal/next-typed-api-routes-runtime";
import path from "path";
import { getTokenFromCookie } from "src/auth/cookie";
import { runtimeConfig } from "src/utils/config";

export interface LogoutSchema {
  method: "DELETE";

  responses: {
    204: null;
  }
}

interface AuthLogoutSchema {
    query: { token: string },
    responses: { 204: null }
}

export default route<LogoutSchema>("LogoutSchema", async (req) => {

  const token = getTokenFromCookie({ req });

  if (token) {
    return await jsonFetch<AuthLogoutSchema>({
      method: "DELETE",
      path: path.join(runtimeConfig.AUTH_INTERNAL_URL, "/token"),
      query: { token },
    })
      .then(() => ({ 204: null }));
  } else {
    return { 204: null };
  }

});
