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

import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { setTokenCookie } from "src/auth/cookie";
import { validateToken } from "src/auth/token";
import { publicConfig } from "src/utils/config";

export interface AuthCallbackSchema {
  method: "GET";

  query: {
    token: string;
  }

  responses: {
    200: null;
    /** the token is invalid */
    403: null;
  }
}


export default route<AuthCallbackSchema>("AuthCallbackSchema", async (req, res) => {

  const { token } = req.query;

  if (await validateToken(token)) {
    // set token cache
    setTokenCookie({ res }, token);
    res.redirect(publicConfig.BASE_PATH || "/");
  } else {
    return { 403: null };

  }

});
