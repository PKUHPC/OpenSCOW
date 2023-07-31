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
import { OperationCode, OperationType } from "@scow/protos/build/server/operation_log";
import { UserServiceClient } from "@scow/protos/build/server/user";
import { Type } from "@sinclair/typebox";
import { authenticate } from "src/auth/server";
import { PlatformRole, UserRole } from "src/models/User";
import { checkNameMatch } from "src/server/checkIdNameMatch";
import { getClient } from "src/utils/client";
import { logOperation } from "src/utils/logOperation";
import { handlegRPCError, parseIp } from "src/utils/server";

export const AddUserToAccountSchema = typeboxRouteSchema({
  method: "POST",

  body: Type.Object({
    identityId: Type.String(),
    accountName: Type.String(),
    name: Type.String(),
  }),

  responses: {
    204: Type.Null(),

    400: Type.Object({
      code: Type.Literal("ID_NAME_NOT_MATCH"),
    }),

    404: Type.Object({
      code: Type.Union([
        Type.Literal("ACCOUNT_NOT_FOUND"),
        Type.Literal("USER_NOT_FOUND"),
      ]),
    }),

    /** 用户已经存在 */
    409: Type.Null(),

  },
});

export default /* #__PURE__*/typeboxRoute(AddUserToAccountSchema, async (req, res) => {
  const { identityId, accountName, name } = req.body;

  const auth = authenticate((u) =>
    u.platformRoles.includes(PlatformRole.PLATFORM_ADMIN) ||
    u.accountAffiliations.find((x) => x.accountName === accountName)?.role !== UserRole.USER);

  const info = await auth(req, res);

  if (!info) { return; }

  const result = await checkNameMatch(identityId, name);

  if (result === "NotFound") {
    return { 404: { code: "USER_NOT_FOUND" as const } };
  }

  if (result === "NotMatch") {
    return { 400: { code: "ID_NAME_NOT_MATCH" as const } };
  }

  const logInfo = {
    operatorUserId: info.identityId,
    operatorIp: parseIp(req) || "",
    operationCode: OperationCode.ACCOUNT_ADD_USER,
    operationType: OperationType.ADD_USER,
    operationContent: `将用户${name}添加到账户${accountName}中`,
    operationTargetAccountName: accountName,
  };

  // call ua service to add user
  const client = getClient(UserServiceClient);

  return await asyncClientCall(client, "addUserToAccount", {
    tenantName: info.tenant,
    accountName,
    userId: identityId,
  }).then(() =>
  {
    logOperation(logInfo, true);
    return { 204: null };
  }).catch(handlegRPCError({
    [Status.ALREADY_EXISTS]: () => ({ 409: null }),
    [Status.NOT_FOUND]: () => ({ 404: { code: "ACCOUNT_NOT_FOUND" as const } }),
  },
  () => logOperation(logInfo, false),
  ));
});
