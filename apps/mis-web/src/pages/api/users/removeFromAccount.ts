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

import { typeboxRouteSchema } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncClientCall } from "@ddadaal/tsgrpc-client";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { UserServiceClient } from "@scow/protos/build/server/user";
import { Type } from "@sinclair/typebox";
import { authenticate } from "src/auth/server";
import { PlatformRole, UserRole } from "src/models/User";
import { getClient } from "src/utils/client";
import { route } from "src/utils/route";
import { handlegRPCError } from "src/utils/server";

export const RemoveUserFromAccountSchema = typeboxRouteSchema({
  method: "DELETE",

  query: Type.Object({
    accountName: Type.String(),
    identityId: Type.String(),
  }),

  responses: {
    204: Type.Null(),
    // 用户不存在
    404: Type.Null(),

    // 不能移出账户拥有者
    406: Type.Null(),

  },
});

export default /* #__PURE__*/route(RemoveUserFromAccountSchema, async (req, res) => {
  const { identityId, accountName } = req.query;

  const auth = authenticate((u) =>
    u.platformRoles.includes(PlatformRole.PLATFORM_ADMIN) ||
    u.accountAffiliations.find((x) => x.accountName === accountName)?.role !== UserRole.USER);

  const info = await auth(req, res);

  if (!info) { return; }

  // call ua service to add user
  const client = getClient(UserServiceClient);

  return await asyncClientCall(client, "removeUserFromAccount", {
    tenantName: info.tenant,
    accountName,
    userId: identityId,
  })
    .then(() => ({ 204: null }))
    .catch(handlegRPCError({
      [Status.NOT_FOUND]: () => ({ 404: null }),
      [Status.OUT_OF_RANGE]: () => ({ 406: null }),
    }));
});
