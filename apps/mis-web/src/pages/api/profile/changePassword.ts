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
import { changePassword as libChangePassword, getCapabilities, HttpError } from "@scow/lib-auth";
import { OperationType } from "@scow/lib-operation-log";
import { Type } from "@sinclair/typebox";
import { authenticate } from "src/auth/server";
import { OperationResult } from "src/models/operationLog";
import { callLog } from "src/server/operationLog";
import { publicConfig, runtimeConfig } from "src/utils/config";
import { parseIp } from "src/utils/server";
// 此API用于用户修改自己的密码。
export const ChangePasswordSchema = typeboxRouteSchema({

  method: "PATCH",

  body: Type.Object({
    newPassword: Type.String(),
  }),

  responses: {
    /** 更改成功 */
    204: Type.Null(),

    400: Type.Object({
      code: Type.Literal("PASSWORD_NOT_VALID"),
    }),

    /** 用户未找到 */
    404: Type.Null(),

    /** 本功能在当前配置下不可用。 */
    501: Type.Null(),
  },
});

const passwordPattern = publicConfig.PASSWORD_PATTERN && new RegExp(publicConfig.PASSWORD_PATTERN);

export default /* #__PURE__*/typeboxRoute(ChangePasswordSchema, async (req, res) => {

  if (!publicConfig.ENABLE_CHANGE_PASSWORD) {
    return { 501: null };
  }

  const ldapCapabilities = await getCapabilities(runtimeConfig.AUTH_INTERNAL_URL);
  if (!ldapCapabilities.changePassword) {
    return { 501: null };
  }

  const auth = authenticate(() => true);

  const info = await auth(req, res);

  if (!info) { return; }

  const { newPassword } = req.body;

  if (passwordPattern && !passwordPattern.test(newPassword)) {
    return { 400: {
      code: "PASSWORD_NOT_VALID" as const,
    } };
  }

  const logInfo = {
    operatorUserId: info.identityId,
    operatorIp: parseIp(req) ?? "",
    operationTypeName: OperationType.changePassword,
  };

  return await libChangePassword(runtimeConfig.AUTH_INTERNAL_URL, {
    identityId: info.identityId,
    newPassword,
  }, console)
    .then(async () => {
      await callLog(logInfo, OperationResult.SUCCESS);
      return { 204: null };
    })
    .catch(async (e) => {
      await callLog(logInfo, OperationResult.FAIL);

      if (e instanceof HttpError) {
        switch (e.status) {
          case 404:
            return { 404: null };
          case 501:
            return { 501: null };
          default:
            throw e;
        }
      } else {
        throw e;
      }

    });


});
