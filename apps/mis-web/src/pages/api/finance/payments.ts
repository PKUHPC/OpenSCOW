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
import { TenantRole, UserInfo, UserRole } from "src/models/User";
import { ensureNotUndefined } from "src/utils/checkNull";
import { getClient } from "src/utils/client";

export const PaymentInfo = Type.Object({
  index: Type.Number(),
  accountName: Type.Optional(Type.String()),
  time: Type.String(),
  type: Type.String(),
  amount: Type.Number(),
  comment: Type.String(),
  ipAddress: Type.String(),
  operatorId: Type.String(),
});
export type PaymentInfo = Static<typeof PaymentInfo>;

export const GetPaymentsSchema = typeboxRouteSchema({
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
    /**
     * 是否为搜索租户的记录，因getPaymentRecords这个API中有两种情况均是只传了tenantName参数
     * 加入searchTenant区分是搜索账户还是租户的记录
     */
    searchTenant:Type.Optional(Type.Boolean()),
  }),

  responses: {
    200: Type.Object({
      results: Type.Array(PaymentInfo),
      total: Type.Number(),
    }),
  },
});

export default typeboxRoute(GetPaymentsSchema, async (req, res) => {

  const { endTime, startTime, accountName, searchTenant } = req.query;

  const client = getClient(ChargingServiceClient);

  let user: UserInfo | undefined;

  // check whether the user can access the account
  if (accountName) {
    user = await authenticate((i) =>
      i.tenantRoles.includes(TenantRole.TENANT_FINANCE) || 
      i.tenantRoles.includes(TenantRole.TENANT_ADMIN) || 
      i.accountAffiliations.some((x) => x.accountName === accountName && x.role !== UserRole.USER),
    )(req, res);
    if (!user) { return; }
  } else {
    user = await authenticate((i) =>
      i.tenantRoles.includes(TenantRole.TENANT_FINANCE) || 
      i.tenantRoles.includes(TenantRole.TENANT_ADMIN),
    )(req, res);
    if (!user) { return; }
  }
  
  const reply = ensureNotUndefined(await asyncClientCall(client, "getPaymentRecords", {
    target:accountName ? 
      { $case:"accountOfTenant", accountOfTenant:{ tenantName:user.tenant, accountName:accountName as string } } : 
      searchTenant ? { $case:"tenant", tenant:{ tenantName:user.tenant } } :
        { $case:"accountsOfTenant", accountsOfTenant:{ tenantName:user.tenant } },
    startTime,
    endTime,
  }), ["total"]);

  const returnAuditInfo = user.tenantRoles.includes(TenantRole.TENANT_FINANCE) || 
          user.tenantRoles.includes(TenantRole.TENANT_ADMIN);

  const records = reply.results.map((x) => {
    const obj = ensureNotUndefined(x, ["time", "amount"]);

    return {
      accountName: obj.accountName,
      comment: obj.comment,
      index: obj.index,
      ipAddress: returnAuditInfo ? obj.ipAddress : "",
      operatorId: returnAuditInfo ? obj.operatorId : "",
      time: obj.time,
      type: obj.type,
      amount: moneyToNumber(obj.amount),
    } as PaymentInfo;
  });

  return {
    200: {
      results: records,
      total: moneyToNumber(reply.total),
    },
  };
});
