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
import { validateCallbackHostname } from "src/auth/callback";

const QuerystringSchema = Type.Object({
  callbackUrl: Type.String({ description: "回调地址" }),
});

export const authRoute = fp(async (f) => {
  f.get<{ Querystring: Static<typeof QuerystringSchema> }>(
    "/public/auth",
    {
      schema: {
        querystring: QuerystringSchema,
      },
    },
    async (req, rep) => {

      const callbackUrl = req.query.callbackUrl;

      await validateCallbackHostname(callbackUrl, req);


      await f.auth.serveLoginHtml(callbackUrl, req, rep);
    },
  );
});
