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
import { moneyToNumber } from "@scow/lib-decimal";
import { ChargingServiceClient } from "@scow/protos/build/server/charging";
import { Static, Type } from "@sinclair/typebox";
import { authenticate } from "src/auth/server";
import { PlatformRole, TenantRole, UserRole } from "src/models/User";
import { ensureNotUndefined } from "src/utils/checkNull";
import { getClient } from "src/utils/client";

export const ChargeInfo = Type.Object({
  index: Type.Number(),
  accountName: Type.String(),
  time: Type.String(),
  type: Type.String(),
  amount: Type.Number(),
  comment: Type.String(),
  tenantName: Type.String(),
});
export type ChargeInfo = Static<typeof ChargeInfo>;

export const GetChargesSchema = typeboxRouteSchema({
  method: "GET",

  query: Type.Object({
    /**
     * @format date-time
     */
    startTime: Type.String({ format: "date-time" }),

    /**
     * @format date-time
     */
    endTime: Type.String({ format: "date-time" }),

    accountName: Type.Optional(Type.String()),

    tenantName: Type.Optional(Type.String()),
  }),

  responses: {
    200: Type.Object({
      results: Type.Array(ChargeInfo),
      total: Type.Number(),
    }),
  },
});

export default typeboxRoute(GetChargesSchema, async (req, res) => {
  const { endTime, startTime, accountName, tenantName } = req.query;

  const auth = authenticate((i) =>
    (i.accountAffiliations.some((x) => x.accountName === accountName && x.role !== UserRole.USER)
      ||
      (i.platformRoles.includes(PlatformRole.PLATFORM_ADMIN) || i.platformRoles.includes(PlatformRole.PLATFORM_FINANCE))
      ||
      (i.tenantRoles.includes(TenantRole.TENANT_ADMIN) || i.tenantRoles.includes(TenantRole.TENANT_FINANCE))
    ));

  const info = await auth(req, res);

  if (!info) { return; }

  const client = getClient(ChargingServiceClient);

  const reply = ensureNotUndefined(await asyncClientCall(client, "getChargeRecords", {
    accountName,
    startTime,
    endTime,
    // 如果账户不为undefined则查询租户下该账户的消费记录
    // 如果账户为undefined，租户不为undefined则查询租户下所有账户消费记录
    // 如果账户和租户均为undefined,则查询所有租户下账户的消费记录
    tenantName: accountName ? info.tenant : tenantName,
  }), ["total"]);

  const accounts = reply.results.map((x) => {
    const obj = ensureNotUndefined(x, ["time", "amount", "accountName"]);

    return {
      ...obj,
      amount: moneyToNumber(obj.amount),
    };
  });

  return {
    200: {
      results: accounts,
      total: moneyToNumber(reply.total),
    },
  };
});
