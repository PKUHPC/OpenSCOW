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
import { asyncClientCall } from "@ddadaal/tsgrpc-client";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { getCapabilities } from "@scow/lib-auth";
import { UserServiceClient } from "@scow/protos/build/server/user";
import { Type } from "@sinclair/typebox";
import { authenticate } from "src/auth/server";
import { getClient } from "src/utils/client";
import { runtimeConfig } from "src/utils/config";
import { handlegRPCError } from "src/utils/server";



// 此API用于用户修改自己的邮箱。
export const ChangeEmailSchema = typeboxRouteSchema({

  method: "PATCH",

  body: Type.Object({
    userId:Type.String(),
    newEmail: Type.String(),
  }),

  responses: {
    /** 更改成功 */
    204: Type.Null(),

    /** 用户未找到 */
    404: Type.Null(),

    /** 修改失败 */
    500: Type.Null(),

    /** 本功能在当前配置下不可用。 */
    501: Type.Null(),
  },
});

export default /* #__PURE__*/typeboxRoute(ChangeEmailSchema, async (req, res) => {
  const auth = authenticate(() => true);

  const info = await auth(req, res);

  if (!info) { return; }

  const ldapCapabilities = await getCapabilities(runtimeConfig.AUTH_INTERNAL_URL);
  if (!ldapCapabilities.changeEmail) {
    return { 501: null };
  }

  const { userId, newEmail } = req.body;

  const client = getClient(UserServiceClient);

  return await asyncClientCall(client, "changeEmail", {
    userId,
    newEmail,
  })
    .then(() => ({ 204: null }))
    .catch(handlegRPCError({
      [Status.NOT_FOUND]: () => ({ 404: null }),
      [Status.UNKNOWN]: () => ({ 500: null }),
      [Status.UNIMPLEMENTED]: () => ({ 501: null }),
    }));
});
