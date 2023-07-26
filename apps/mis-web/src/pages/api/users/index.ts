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
import { UserServiceClient } from "@scow/protos/build/server/user";
import { Type } from "@sinclair/typebox";
import { authenticate } from "src/auth/server";
import { PlatformRole, TenantRole, UserRole } from "src/models/User";
import { AccountUserInfo } from "src/models/UserSchemaModel";
import { getClient } from "src/utils/client";

export const GetAccountUsersSchema = typeboxRouteSchema({
  method: "GET",

  query: Type.Object({
    accountName: Type.String(),
  }),

  responses: {
    200: Type.Object({
      results: Type.Array(AccountUserInfo),
    }),
  },
});

export default typeboxRoute(GetAccountUsersSchema, async (req, res) => {

  const { accountName } = req.query;

  const auth = authenticate((u) => {
    return u.platformRoles.includes(PlatformRole.PLATFORM_ADMIN) ||
    u.accountAffiliations.find((x) => x.accountName === accountName)?.role !== UserRole.USER ||
    u.tenantRoles.includes(TenantRole.TENANT_ADMIN);
  });

  const info = await auth(req, res);

  if (!info) { return; }

  const client = getClient(UserServiceClient);

  const reply = await asyncClientCall(client, "getAccountUsers", {
    tenantName: info.tenant,
    accountName,
  });

  return {
    200: {
      results: reply.results,
    },
  };

});
