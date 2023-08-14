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

import { Type, typeboxRoute, typeboxRouteSchema } from "@ddadaal/next-typed-api-routes-runtime";
import { setTokenCookie } from "src/auth/cookie";
import { validateToken } from "src/auth/token";
import { OperationResult, OperationType } from "src/models/operationLog";
import { callLog } from "src/server/operationLog";
import { publicConfig } from "src/utils/config";
import { parseIp } from "src/utils/server";

export const AuthCallbackSchema = typeboxRouteSchema({
  method: "GET",

  query: Type.Object({
    token: Type.String(),
  }),

  responses: {
    200: Type.Null(),
    /** the token is invalid */
    403: Type.Null(),
  },
});


export default typeboxRoute(AuthCallbackSchema, async (req, res) => {

  const { token } = req.query;

  const info = await validateToken(token);

  if (info) {
    // set token cache
    setTokenCookie({ res }, token);
    const logInfo = {
      operatorUserId: info.identityId,
      operatorIp: parseIp(req) ?? "",
      operationTypeName: OperationType.LOGIN,
    };
    callLog(logInfo, OperationResult.SUCCESS);
    res.redirect(publicConfig.BASE_PATH);
  } else {
    return { 403: null };
  }

});
