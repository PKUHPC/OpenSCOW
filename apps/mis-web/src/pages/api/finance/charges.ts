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
import { PlatformRole, SearchType, TenantRole, UserInfo, UserRole } from "src/models/User";
import { ensureNotUndefined } from "src/utils/checkNull";
import { getClient } from "src/utils/client";

export const ChargeInfo = Type.Object({
  index: Type.Number(),
  accountName: Type.Optional(Type.String()),
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

    // 是否为平台管理下的记录：如果是则需查询所有租户，如果不是只查询当前租户
    isPlatformRecords: Type.Optional(Type.Boolean()),

    // 查询消费记录种类：平台账户消费记录或租户消费记录
    searchType: Type.Optional(Type.Enum(SearchType)),
  }),

  responses: {
    200: Type.Object({
      results: Type.Array(ChargeInfo),
      total: Type.Number(),
    }),
  },
});

export default typeboxRoute(GetChargesSchema, async (req, res) => {
  const { endTime, startTime, accountName, isPlatformRecords, searchType } = req.query;

  let info: UserInfo | undefined;
  // check whether the user can access the account
  if (accountName) {
    info = await authenticate((i) =>
      i.platformRoles.includes(PlatformRole.PLATFORM_ADMIN) ||
      i.platformRoles.includes(PlatformRole.PLATFORM_FINANCE) ||
      i.tenantRoles.includes(TenantRole.TENANT_FINANCE) ||
      i.tenantRoles.includes(TenantRole.TENANT_ADMIN) ||
      i.accountAffiliations.some((x) => x.accountName === accountName && x.role !== UserRole.USER),
    )(req, res);
    if (!info) { return; }
  } else {
    info = await authenticate((i) =>
      i.platformRoles.includes(PlatformRole.PLATFORM_ADMIN) ||
      i.platformRoles.includes(PlatformRole.PLATFORM_FINANCE) ||
      i.tenantRoles.includes(TenantRole.TENANT_FINANCE) ||
      i.tenantRoles.includes(TenantRole.TENANT_ADMIN),
    )(req, res);
    if (!info) { return; }
  }

  const client = getClient(ChargingServiceClient);

  const reply = ensureNotUndefined(await asyncClientCall(client, "getChargeRecords", {
    startTime,
    endTime,
    target: (() => {
      if (accountName) {
        // 如果 accountName 不为 undefined，则查询当前租户下该账户的消费记录
        return {
          $case: "accountOfTenant" as const,
          accountOfTenant: { tenantName: info.tenant, accountName: accountName },
        };
      } else {
        if (searchType === SearchType.ACCOUNT) {
          if (isPlatformRecords) {
            // 查询平台下所有租户的账户消费记录
            return {
              $case: "accountsOfAllTenants" as const,
              accountsOfAllTenants: { },
            };
          } else {
            // 查询当前租户的账户消费记录
            return {
              $case: "accountsOfTenant" as const,
              accountsOfTenant: { tenantName: info.tenant },
            };
          }
        } else {
          if (isPlatformRecords) {
            // 查询平台下所有租户的租户消费记录
            return {
              $case: "allTenants" as const,
              allTenants: { },
            };
          } else {
            // 查询当前租户的租户消费记录
            return {
              $case: "tenant" as const,
              tenant: { tenantName: info.tenant },
            };
          }
        }
      }
    })(),
  }), ["total"]);

  const accounts = reply.results.map((x) => {
    // 如果是查询平台账户消费记录或者查询账户下的消费记录时，确保accuntName存在
    const obj = (searchType === SearchType.ACCOUNT || accountName) ?
      ensureNotUndefined(x, ["time", "amount", "accountName"]) : ensureNotUndefined(x, ["time", "amount"]);

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
