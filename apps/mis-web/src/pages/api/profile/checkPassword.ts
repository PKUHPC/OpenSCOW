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

import { typeboxRoute, typeboxRouteSchema } from "@ddadaal/next-typed-api-routes-runtime";
import { checkPassword as libCheckPassword } from "@scow/lib-auth";
import { Type } from "@sinclair/typebox";
import { authenticate } from "src/auth/server";
import { runtimeConfig } from "src/utils/config";
export const CheckPasswordSchema = typeboxRouteSchema({
  method: "GET",

  query: Type.Object({ password: Type.String() }),

  responses: {
    /** 返回检查的结果 */
    200: Type.Object({
      success: Type.Boolean(),
    }),
    /** 用户不存在 */
    404: Type.Null(),
    /** 本功能在当前配置下不可用。 */
    501: Type.Null(),
  },

});

export default typeboxRoute(CheckPasswordSchema, async (req, res) => {
  const auth = authenticate(() => true);

  const info = await auth(req, res);

  if (!info) { return; }

  const { password } = req.query;

  return await libCheckPassword(runtimeConfig.AUTH_INTERNAL_URL, {
    identityId: info.identityId,
    password: password,
  }, console)
    .then((result) => {
      if (!result) {
        return { 404: null };
      }
      else {
        return { 200: { success: result.success } };
      }
    })
    .catch((e) => {
      switch (e.status) {
      case "NOT_SUPPORTED":
        return { 501: null };
      default:
        throw e;
      }
    });
});
