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
import { ChargingServiceClient } from "@scow/protos/build/server/charging";
import { authenticate } from "src/auth/server";
import { TenantRole, UserInfo, UserRole } from "src/models/User";
import { ensureNotUndefined } from "src/utils/checkNull";
import { getClient } from "src/utils/client";

export interface PaymentInfo {
  index: number;
  accountName?: string;
  time: string;
  type: string;
  amount: number;
  comment: string;
  ipAddress: string;
  operatorId: string;
}

export interface GetPaymentsSchema {
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

    accountName?: string;
  };

  responses: {
    200: {
      results: PaymentInfo[];
      total: number;
    }
  }
}

export default route<GetPaymentsSchema>("GetPaymentsSchema", async (req, res) => {

  const { endTime, startTime, accountName } = req.query;

  const client = getClient(ChargingServiceClient);

  let user: UserInfo | undefined;

  // check whether the user can access the account
  if (accountName) {
    user = await authenticate((i) =>
      i.tenantRoles.includes(TenantRole.TENANT_FINANCE)
      || i.accountAffiliations.some((x) => x.accountName === accountName && x.role !== UserRole.USER),
    )(req, res);
    if (!user) { return; }
  } else {
    user = await authenticate((i) =>
      i.tenantRoles.includes(TenantRole.TENANT_FINANCE),
    )(req, res);
    if (!user) { return; }
  }

  const reply = ensureNotUndefined(await asyncClientCall(client, "getPaymentRecords", {
    tenantName: user.tenant,
    accountName,
    startTime,
    endTime,
  }), ["total"]);

  const returnAuditInfo = user.tenantRoles.includes(TenantRole.TENANT_FINANCE);

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
