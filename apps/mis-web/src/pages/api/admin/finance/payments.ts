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

import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncClientCall } from "@ddadaal/tsgrpc-client";
import { moneyToNumber } from "@scow/lib-decimal";
import { authenticate } from "src/auth/server";
import { ChargingServiceClient } from "src/generated/server/charging";
import { PlatformRole } from "src/models/User";
import { ensureNotUndefined } from "src/utils/checkNull";
import { getClient } from "src/utils/client";

export interface TenantPaymentInfo {
    index: number;
    tenantName: string;
    time: string;
    type: string;
    amount: number;
    comment: string;
    ipAddress: string;
    operatorId: string;
} 

export interface GetTenantPaymentsSchema {
  method: "GET";

  query: {
    /**
     * @format date-time
     */
    startTime: string;

    /**
     * @format date-time
     */
    endTime: string;

    tenantName?: string;
  };

  responses: {
    200: {
      results: TenantPaymentInfo[];
      total: number;
    }
  }
}

export default route<GetTenantPaymentsSchema>("GetTenantPaymentsSchema", async (req, res) => {
  const { endTime, startTime, tenantName } = req.query;

  const client = getClient(ChargingServiceClient);

  const user = await authenticate((i) => i.platformRoles.includes(PlatformRole.PLATFORM_FINANCE))(req, res);
  if (!user) { return; }

  const reply = ensureNotUndefined(await asyncClientCall(client, "getPaymentRecords", {
    tenantName,
    startTime,
    endTime,
  }), ["total"]);

  const tenants = reply.results.map((x) => {
    const obj = ensureNotUndefined(x, ["time", "amount"]);

    return {
      tenantName: obj.tenantName,
      comment: obj.comment,
      index:obj.index,
      ipAddress: obj.ipAddress,
      operatorId: obj.operatorId,
      time: obj.time,
      type: obj.type,
      amount: moneyToNumber(obj.amount),
    } as TenantPaymentInfo;
  });

  return {
    200: {
      results: tenants,
      total: moneyToNumber(reply.total),
    },
  };
});