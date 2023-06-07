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
import { AccountServiceClient, GetAccountsRequest } from "@scow/protos/build/server/account";
import { Static, Type } from "@sinclair/typebox";
import { authenticate } from "src/auth/server";
import { TenantRole } from "src/models/User";
import { Money } from "src/models/UserSchemaModel";
import { ensureNotUndefined } from "src/utils/checkNull";
import { getClient } from "src/utils/client";

export const AdminAccountInfo = Type.Object({
  tenantName: Type.String(),
  accountName: Type.String(),
  userCount: Type.Number(),
  blocked: Type.Boolean(),
  ownerId: Type.String(),
  ownerName: Type.String(),
  comment: Type.String(),
  balance: Money,
});
export type AdminAccountInfo = Static<typeof AdminAccountInfo>;

export const GetAccountsSchema = typeboxRouteSchema({
  method: "GET",

  responses: Type.Object({
    200: Type.Object({
      results: Type.Array(AdminAccountInfo),
    }),
  }),
});

export async function getAccounts(req: GetAccountsRequest) {
  const uaClient = getClient(AccountServiceClient);

  const { results } = await asyncClientCall(uaClient, "getAccounts", req);

  return results.map((x) => ensureNotUndefined(x, ["balance"]));
}

const auth = authenticate((info) => info.tenantRoles.includes(TenantRole.TENANT_ADMIN)
  || info.tenantRoles.includes(TenantRole.TENANT_FINANCE));

export default typeboxRoute(GetAccountsSchema,
  async (req, res) => {

    const info = await auth(req, res);
    if (!info) {
      return;
    }

    const results = await getAccounts({ tenantName: info.tenant });

    return { 200: { results } };
  });
