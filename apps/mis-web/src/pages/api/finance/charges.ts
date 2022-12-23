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
import { UserRole } from "src/models/User";
import { ensureNotUndefined } from "src/utils/checkNull";
import { getClient } from "src/utils/client";

export interface ChargeInfo {
  index: number;
  accountName: string;
  time: string;
  type: string;
  amount: number;
  comment: string;
}

export interface GetChargesSchema {
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

    accountName: string;
  };

  responses: {
    200: {
      results: ChargeInfo[];
      total: number;
    }
  }
}

export default route<GetChargesSchema>("GetChargesSchema", async (req, res) => {
  const { endTime, startTime, accountName } = req.query;

  const auth = authenticate((i) =>
    i.accountAffiliations.some((x) => x.accountName === accountName && x.role !== UserRole.USER));

  const info = await auth(req, res);

  if (!info) { return; }

  const client = getClient(ChargingServiceClient);

  const reply = ensureNotUndefined(await asyncClientCall(client, "getChargeRecords", {
    accountName,
    startTime,
    endTime,
    tenantName: info.tenant,
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
