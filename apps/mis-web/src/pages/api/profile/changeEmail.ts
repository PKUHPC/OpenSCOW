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
import { changeEmail as libChangeEmail } from "@scow/lib-auth";
import { Type } from "@sinclair/typebox";
import { authenticate } from "src/auth/server";
import { publicConfig, runtimeConfig } from "src/utils/config";

// 此API用于用户修改自己的邮箱。
export const ChangeEmailSchema = typeboxRouteSchema({

  method: "PATCH",

  body: Type.Object({
    newEmail: Type.String(),
  }),

  responses: {
    /** 更改成功 */
    204: Type.Null(),

    /** 用户未找到 */
    404: Type.Null(),

    /** 本功能在当前配置下不可用。 */
    501: Type.Null(),
  },
});

export default /* #__PURE__*/typeboxRoute(ChangeEmailSchema, async (req, res) => {

  if (!publicConfig.ENABLE_CHANGE_EMAIL) {
    return { 501: null };
  }

  const auth = authenticate(() => true);

  const info = await auth(req, res);

  if (!info) { return; }

  const { newEmail } = req.body;


  return await libChangeEmail(runtimeConfig.AUTH_INTERNAL_URL, {
    identityId: info.identityId,
    newEmail,
  }, console)
    .then(() => {
      return ({ 204: null });
    })
    .catch((e) => {
      switch (e.status) {
      case "NOT_FOUND":
        return { 404: null };
      case "NOT_SUPPORTED":
        return { 501: null };
      default:
        throw e;
      }
    });


});
