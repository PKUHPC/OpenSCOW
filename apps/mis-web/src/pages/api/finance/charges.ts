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
import { AccountOfTenantTarget, AccountsOfAllTenantsTarget, AccountsOfTenantTarget, AllTenantsTarget,
  ChargingServiceClient, TenantTarget } from "@scow/protos/build/server/charging";
import { Static, Type } from "@sinclair/typebox";
import { authenticate } from "src/auth/server";
import { PlatformRole, SearchType, TenantRole, UserInfo, UserRole } from "src/models/User";
import { ensureNotUndefined } from "src/utils/checkNull";
import { getClient } from "src/utils/client";
import { convertProtoToJsonMap } from "src/utils/metadata";

// export const MetadataMap = Type.Object({
//   metadataValue: Type.Record(
//     Type.String(),
//     Type.Union([
//       Type.Object({ stringValue: Type.String() }),
//       Type.Object({ numberValue: Type.Number() }),
//       Type.Object({ boolValue: Type.Boolean() }),
//       Type.Object({ nullValue: Type.Null() }),
//     ]),
//   ) });


export const MetadataMap = Type.Object({
  metadataValue: Type.Record(
    Type.String(),
    Type.Union([
      Type.String(),
      Type.Number(),
      Type.Boolean(),
      Type.Null(),
    ]),
  ) });
export type MetadataMapType = Static<typeof MetadataMap>;

export const ChargeInfo = Type.Object({
  index: Type.Number(),
  accountName: Type.Optional(Type.String()),
  time: Type.String(),
  type: Type.String(),
  amount: Type.Number(),
  comment: Type.String(),
  tenantName: Type.String(),
  userId: Type.Optional(Type.String()),
  metadata: Type.Optional(MetadataMap),
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

    // 消费类型
    type: Type.Optional(Type.String()),

    accountName: Type.Optional(Type.String()),

    // 是否为平台管理下的记录：如果是则需查询所有租户，如果不是只查询当前租户
    isPlatformRecords: Type.Optional(Type.Boolean()),

    // 查询消费记录种类：平台账户消费记录或租户消费记录
    searchType: Type.Optional(Type.Enum(SearchType)),

    /**
     * @minimum 1
     * @type integer
     */
    page: Type.Optional(Type.Integer({ minimum: 1 })),

    /**
     * @type integer
     */
    pageSize: Type.Optional(Type.Integer()),
  }),

  responses: {
    200: Type.Object({
      results: Type.Array(ChargeInfo),
    }),
  },
});

export async function getUserInfoForCharges(accountName: string | undefined, req, res): Promise<UserInfo | undefined> {
  if (accountName) {
    return await authenticate((i) =>
      i.platformRoles.includes(PlatformRole.PLATFORM_ADMIN) ||
      i.platformRoles.includes(PlatformRole.PLATFORM_FINANCE) ||
      i.tenantRoles.includes(TenantRole.TENANT_FINANCE) ||
      i.tenantRoles.includes(TenantRole.TENANT_ADMIN) ||
      i.accountAffiliations.some((x) => x.accountName === accountName && x.role !== UserRole.USER),
    )(req, res);
  } else {
    return await authenticate((i) =>
      i.platformRoles.includes(PlatformRole.PLATFORM_ADMIN) ||
      i.platformRoles.includes(PlatformRole.PLATFORM_FINANCE) ||
      i.tenantRoles.includes(TenantRole.TENANT_FINANCE) ||
      i.tenantRoles.includes(TenantRole.TENANT_ADMIN),
    )(req, res);
  }
}

export const buildChargesRequestTarget = (accountName: string | undefined, info: UserInfo,
  searchType: SearchType | undefined, isPlatformRecords: boolean | undefined): (
    { $case: "accountOfTenant"; accountOfTenant: AccountOfTenantTarget }
    | { $case: "accountsOfTenant"; accountsOfTenant: AccountsOfTenantTarget }
    | { $case: "accountsOfAllTenants"; accountsOfAllTenants: AccountsOfAllTenantsTarget }
    | { $case: "tenant"; tenant: TenantTarget }
    | { $case: "allTenants"; allTenants: AllTenantsTarget }
    | undefined
  ) => {
  if (accountName) {
    return {
      $case: "accountOfTenant" as const,
      accountOfTenant: { tenantName: info.tenant, accountName: accountName },
    };
  } else {
    if (searchType === SearchType.ACCOUNT) {
      if (isPlatformRecords) {
        return {
          $case: "accountsOfAllTenants" as const,
          accountsOfAllTenants: {},
        };
      } else {
        return {
          $case: "accountsOfTenant" as const,
          accountsOfTenant: { tenantName: info.tenant },
        };
      }
    } else {
      if (isPlatformRecords) {
        return {
          $case: "allTenants" as const,
          allTenants: {},
        };
      } else {
        return {
          $case: "tenant" as const,
          tenant: { tenantName: info.tenant },
        };
      }
    }
  }
};

export default typeboxRoute(GetChargesSchema, async (req, res) => {
  const { endTime, startTime, accountName, isPlatformRecords, searchType, type, page, pageSize } = req.query;

  const info = await getUserInfoForCharges(accountName, req, res);
  if (!info) return;

  const client = getClient(ChargingServiceClient);

  const reply = ensureNotUndefined(await asyncClientCall(client, "getPaginatedChargeRecords", {
    startTime,
    endTime,
    type,
    target: buildChargesRequestTarget(accountName, info, searchType, isPlatformRecords),
    page,
    pageSize,
  }), []);


  const accounts = reply.results.map((x) => {
    // 如果是查询平台账户消费记录或者查询账户下的消费记录时，确保accountName存在
    const obj = (searchType === SearchType.ACCOUNT || accountName) ?
      ensureNotUndefined(x, ["time", "amount", "accountName"]) : ensureNotUndefined(x, ["time", "amount"]);
    return {
      ...obj,
      amount: moneyToNumber(obj.amount),
      metadata: (obj.metadata && obj.metadata !== null) ? convertProtoToJsonMap(obj.metadata) : undefined,
    };
  });
  return {
    200: {
      results: accounts,
    },
  };
});


