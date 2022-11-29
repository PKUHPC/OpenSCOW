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

import { setTokenCookie } from "src/auth/cookie";
import { validateToken } from "src/auth/token";
import { route } from "src/utils/route";

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

  // query the token and get the username
  const info = await validateToken(token);

  if (info) {
    // set token cache
    setTokenCookie({ res }, token);

    res.redirect(process.env.NEXT_PUBLIC_BASE_PATH || "/");
  } else {
    return { 403: null };

  }

});
