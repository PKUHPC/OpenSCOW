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

import { Static, Type } from "@sinclair/typebox";
import fp from "fastify-plugin";
import { AUTH_REDIRECT_URL } from "src/config/env";

const QuerystringSchema = Type.Object({
  callbackUrl: Type.Optional(Type.String()),
});

/**
 * 发起登录请求，将会返回一个HTML，HTML加载后会重定向至IAAA登录界面
 */
export const authRoute = fp(async (f) => {
  f.get<{ Querystring: Static<typeof QuerystringSchema> }>(
    "/public/auth",
    {
      schema: {
        querystring: QuerystringSchema,
      },
    },
    async (req, rep) => {
      await f.auth.serveLoginHtml(req.query.callbackUrl ?? AUTH_REDIRECT_URL, req, rep);
    },
  );
});
