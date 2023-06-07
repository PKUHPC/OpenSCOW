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
import { InitServiceClient } from "@scow/protos/build/server/init";
import { Type } from "@sinclair/typebox";
import { getClient } from "src/utils/client";
import { queryIfInitialized } from "src/utils/init";

export const SetAsInitAdminSchema = typeboxRouteSchema({
  method: "PATCH",

  body: Type.Object({
    userId: Type.String(),
  }),

  responses: Type.Object({
    204: Type.Null(),

    409: Type.Object({ code: Type.Literal("ALREADY_INITIALIZED") }),

  }),
});

export default typeboxRoute(SetAsInitAdminSchema, async (req) => {
  const result = await queryIfInitialized();

  if (result) { return { 409: { code: "ALREADY_INITIALIZED" } }; }

  const { userId } = req.body;

  const client = getClient(InitServiceClient);

  await asyncClientCall(client, "setAsInitAdmin", {
    userId,
  });

  return { 204: null };

});

