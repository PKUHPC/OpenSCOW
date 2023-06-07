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
import { changePassword as libChangePassword } from "@scow/lib-auth";
import { Type } from "@sinclair/typebox";
import { authenticate } from "src/auth/server";
import { publicConfig, runtimeConfig } from "src/utils/config";

// 此API用于用户修改自己的密码。
export const ChangePasswordSchema = typeboxRouteSchema({

  method: "PATCH",

  body: Type.Object({
    oldPassword: Type.String(),
    newPassword: Type.String(),
  }),

  responses: Type.Object({
    /** 更改成功 */
    204: Type.Null(),

    400: Type.Object({
      code: Type.Literal("PASSWORD_NOT_VALID"),
      message: Type.Union([Type.String(), Type.Undefined()]),
    }),

    /** 用户未找到 */
    404: Type.Null(),

    /** 密码不正确 */
    412: Type.Null(),

    /** 本功能在当前配置下不可用。 */
    501: Type.Null(),
  }),
});

const passwordPattern = publicConfig.PASSWORD_PATTERN && new RegExp(publicConfig.PASSWORD_PATTERN);

export default /* #__PURE__*/typeboxRoute(ChangePasswordSchema, async (req, res) => {

  if (!publicConfig.ENABLE_CHANGE_PASSWORD) {
    return { 501: null };
  }

  const auth = authenticate(() => true);

  const info = await auth(req, res);

  if (!info) { return; }

  const { newPassword, oldPassword } = req.body;

  if (passwordPattern && !passwordPattern.test(newPassword)) {
    return { 400: { code: "PASSWORD_NOT_VALID", message: publicConfig.PASSWORD_PATTERN_MESSAGE } };
  }

  return await libChangePassword(runtimeConfig.AUTH_INTERNAL_URL, {
    identityId: info.identityId,
    newPassword,
    oldPassword,
  }, console)
    .then(() => ({ 204: null }))
    .catch((e) => {
      switch (e.status) {
      case "NOT_FOUND":
        return { 404: null };
      case "WRONG_PASSWORD":
        return { 412: null };
      case "NOT_SUPPORTED":
        return { 501: null };
      default:
        throw e;
      }
    });


});
