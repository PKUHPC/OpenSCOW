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
import { deleteToken } from "@scow/lib-auth";
import { Type } from "@sinclair/typebox";
import { getTokenFromCookie } from "src/auth/cookie";
import { validateToken } from "src/auth/token";
import { OperationResult, OperationType } from "src/models/operationLog";
import { callLog } from "src/server/operationLog";
import { runtimeConfig } from "src/utils/config";
import { parseIp } from "src/utils/server";

export const LogoutSchema = typeboxRouteSchema({
  method: "DELETE",

  responses: {
    204: Type.Null(),
  },
});


export default typeboxRoute(LogoutSchema, async (req) => {

  const token = getTokenFromCookie({ req });

  if (token) {
    const info = await validateToken(token);
    if (info) {
      const logInfo = {
        operatorUserId: info.identityId,
        operatorIp: parseIp(req) ?? "",
        operationTypeName: OperationType.LOGOUT,
      };
      callLog(logInfo, OperationResult.SUCCESS);
    }
    await deleteToken(token, runtimeConfig.AUTH_INTERNAL_URL);
  }
  return { 204: null };

});
