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

export const UserExistsSchema = typeboxRouteSchema({
  method: "POST",

  body: Type.Object({
    identityId: Type.String(),
  }),

  responses: {
    200: Type.Object({
      existsInScow: Type.Boolean(),
      existsInAuth: Type.Union([Type.Boolean(), Type.Undefined()]),
    }),

    // 204: null;
  },
});

export default typeboxRoute(UserExistsSchema, async (req) => {

  const { identityId } = req.body;

  const client = getClient(InitServiceClient);
  const result = await asyncClientCall(client, "userExists", {
    userId: identityId,
  });

  return {
    200:
    {
      existsInScow: result.existsInScow,
      existsInAuth: result.existsInAuth,
    },
  };
});
