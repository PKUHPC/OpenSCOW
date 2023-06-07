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
import { InitServiceClient } from "@scow/protos/build/server/init";
import { Type } from "@sinclair/typebox";
import { getClient } from "src/utils/client";
import { getUserIdRule } from "src/utils/createUser";
import { queryIfInitialized } from "src/utils/init";
import { handlegRPCError } from "src/utils/server";

export const CreateInitAdminSchema = typeboxRouteSchema({
  method: "POST",

  body: Type.Object({
    identityId: Type.String(),
    name: Type.String(),
    email: Type.String(),
    password: Type.String(),
  }),

  responses: Type.Object({
    200: Type.Object({
      createdInAuth: Type.Boolean(),
    }),
    400: Type.Object({ code: Type.Literal("USER_ID_NOT_VALID") }),

    409: Type.Object({ code: Type.Union([
      Type.Literal("ALREADY_INITIALIZED"),
      Type.Literal("ALREADY_EXISTS_IN_SCOW"),
    ]) }),
  }),
});

export default typeboxRoute(CreateInitAdminSchema, async (req) => {
  const result = await queryIfInitialized();

  if (result) { return { 409: { code: "ALREADY_INITIALIZED" as const } }; }

  const { email, identityId, name, password } = req.body;

  const userIdRule = getUserIdRule();

  if (userIdRule && !userIdRule.pattern.test(identityId)) {
    return { 400: {
      code: "USER_ID_NOT_VALID",
      message: userIdRule.message,
    } };
  }

  const client = getClient(InitServiceClient);
  return await asyncClientCall(client, "createInitAdmin", {
    email, name, userId: identityId, password,
  }).then((res) => ({ 200: { createdInAuth: res.createdInAuth } }))
    .catch(handlegRPCError({
      [Status.ALREADY_EXISTS]: () => ({ 409: { code: "ALREADY_EXISTS_IN_SCOW" as const } }),
    }));
});

