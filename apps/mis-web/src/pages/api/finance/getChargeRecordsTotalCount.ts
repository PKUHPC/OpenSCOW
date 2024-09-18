/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * OpenSCOW is licensed under Mulan PSL v2.
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
import { Type } from "@sinclair/typebox";
import { SearchType } from "src/models/User";
import { ensureNotUndefined } from "src/utils/checkNull";
import { getClient } from "src/utils/client";

import { buildChargesRequestTarget, getTenantOfAccount, getUserInfoForCharges } from "./charges";


export const GetChargeRecordsTotalCountSchema = typeboxRouteSchema({
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
    types: Type.Optional(Type.Array(Type.String())),

    accountNames: Type.Optional(Type.Array(Type.String())),

    // 是否为平台管理下的记录：如果是则需查询所有租户，如果不是只查询当前租户
    isPlatformRecords: Type.Optional(Type.Boolean()),

    // 查询消费记录种类：平台账户消费记录或租户消费记录
    searchType: Type.Optional(Type.Enum(SearchType)),

    // 消费的用户id或姓名
    userIdsOrNames: Type.Optional(Type.Array(Type.String())),

  }),

  responses: {
    200: Type.Object({
      totalAmount: Type.Number(),
      totalCount: Type.Number(),
    }),
  },
});

export default typeboxRoute(GetChargeRecordsTotalCountSchema, async (req, res) => {
  const { endTime, startTime, accountNames, isPlatformRecords, searchType, types, userIdsOrNames } = req.query;
  const info = await getUserInfoForCharges(accountNames, req, res);
  if (!info) return;

  const tenantOfAccount = await getTenantOfAccount(accountNames, info);

  const client = getClient(ChargingServiceClient);

  const reply = ensureNotUndefined(await asyncClientCall(client, "getChargeRecordsTotalCount", {
    startTime,
    endTime,
    types:types ?? [],
    target: buildChargesRequestTarget(accountNames, tenantOfAccount, searchType, isPlatformRecords),
    userIdsOrNames:userIdsOrNames ?? [],
  }), ["totalAmount", "totalCount"]);

  return {
    200: {

      totalAmount: reply.totalAmount ? moneyToNumber(reply.totalAmount) : 0,
      totalCount: reply.totalCount,
    },
  };
});
