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

import { redirectToAuthLogin } from "@scow/lib-web/build/routes/auth/redirectToLogin";
import { joinWithUrl } from "@scow/utils";
import { TRPCError } from "@trpc/server";
import { join } from "path";
import { setUserTokenCookie } from "src/server/auth/cookie";
import { getUserInfo } from "src/server/auth/server";
import { validateToken } from "src/server/auth/token";
import { router } from "src/server/trpc/def";
import { baseProcedure, procedure } from "src/server/trpc/procedure/base";
import { publicConfig, runtimeConfig } from "src/utils/config";
import { z } from "zod";

export const auth = router({

  getUserInfo: procedure
    .query(async ({ ctx: { req, res } }) => {
      const userInfo = await getUserInfo(req, res);
      return { user: userInfo };
    }),

  callback: baseProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/auth/callback",
        tags: ["auth"],
        summary: "登录后回调，写入cookie",
      },
    })
    .input(z.object({
      token:z.string(),
      fromAuth:z.boolean(),
    }))
    .output(z.void())
    .query(async ({ ctx: { res }, input }) => {
      const { token, fromAuth } = input;
      const info = await validateToken(token);
      if (info) {
        // set token cache
        setUserTokenCookie(token, res);
        // if (fromAuth) {
        //   const logInfo = {
        //     operatorUserId: info.identityId,
        //     operatorIp: parseIp(req) ?? "",
        //     operationTypeName: OperationType.login,
        //   };
        //   await callLog(logInfo, OperationResult.SUCCESS);
        // }
        res.redirect(publicConfig.BASE_PATH);
      } else {
        throw new TRPCError({
          message: "Token has expired",
          code: "FORBIDDEN",
        });
      }
    }),

  login: baseProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/auth",
        tags: ["auth"],
        summary: "登录",
      },
    })
    .input(z.void())
    .output(z.void())
    .query(async ({ ctx: { req, res } }) => {
      console.log("req", req.headers.host);
      const url = new URL(req.url!, `${ runtimeConfig.PROTOCOL}://${req.headers.host}`);

      const callbackUrl = `${ runtimeConfig.PROTOCOL || "http"}://${req.headers.host}`
       + join(publicConfig.BASE_PATH, "/api/auth/callback");

      const target = joinWithUrl(runtimeConfig.AUTH_EXTERNAL_URL,
        `public/auth?callbackUrl=${encodeURIComponent(callbackUrl)}`);

      res.redirect(target);
    }),
});
