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
import { BillServiceClient } from "@scow/protos/build/server/bill";
import { Static, Type } from "@sinclair/typebox";
import { authenticate } from "src/auth/server";
import { PlatformRole, TenantRole, UserRole } from "src/models/User";
import { Money } from "src/models/UserSchemaModel";
import { ensureNotUndefined } from "src/utils/checkNull";
import { getClient } from "src/utils/client";


export const MetadataMap = Type.Record(
  Type.String(),
  Type.Union([
    Type.String(),
    Type.Number(),
    Type.Boolean(),
    Type.Null(),
  ]),
);
export type MetadataMapType = Static<typeof MetadataMap>;

export const UserBillInfo = Type.Object({
  id: Type.Number(),
  accountName: Type.String(),
  userId: Type.String(),
  name: Type.String(),
  amount: Money,
  type: Type.String(),
  details: Type.Optional(MetadataMap),
  createTime: Type.Optional(Type.String()),
});


export type UserBillInfo = Static<typeof UserBillInfo>;

export const GetUserBillsSchema = typeboxRouteSchema({
  method: "GET",

  query: Type.Object({
    accountName: Type.String(),
    accountBillIds: Type.Array(Type.Number()),
  }),

  responses: {
    200: Type.Object({
      userBills: Type.Array(UserBillInfo),
    }),
  },
});



export default typeboxRoute(GetUserBillsSchema, async (req, res) => {

  const { accountBillIds, accountName } = req.query;

  // 租户、平台、账户的管理员或财务管理员才能导出
  const auth = authenticate((info) =>
    info.tenantRoles.includes(TenantRole.TENANT_ADMIN) ||
    info.tenantRoles.includes(TenantRole.TENANT_FINANCE) ||
    info.platformRoles.includes(PlatformRole.PLATFORM_ADMIN) ||
    info.platformRoles.includes(PlatformRole.PLATFORM_FINANCE) ||
    info.accountAffiliations.some((x) => x.accountName === accountName && x.role !== UserRole.USER));

  const user = await auth(req, res);

  if (!user) { return; }

  const client = getClient(BillServiceClient);

  const reply = await asyncClientCall(client, "getUserBills", {
    accountBillIds,
  });

  return {
    200: {
      userBills: reply.userBills.map((i) => ensureNotUndefined(i, ["amount"])),
    },
  };
});
