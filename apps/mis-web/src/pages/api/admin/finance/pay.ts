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

import { asyncClientCall } from "@ddadaal/tsgrpc-client";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { moneyToNumber, numberToMoney } from "@scow/lib-decimal";
import { ChargingServiceClient } from "@scow/protos/build/server/charging";
import { authenticate } from "src/auth/server";
import { PlatformRole } from "src/models/User";
import { ensureNotUndefined } from "src/utils/checkNull";
import { getClient } from "src/utils/client";
import { route } from "src/utils/route";
import { handlegRPCError, parseIp } from "src/utils/server";


export interface TenantFinancePaySchema {
  method: "POST";

  body: {
    amount: number;
    tenantName: string;
    comment?: string;
    type: string;
  }

  responses: {
    200: {
      balance: number;
    }
    // tenant is not found in platform.
    404: null;

  }
}

const auth = authenticate((info) => info.platformRoles.includes(PlatformRole.PLATFORM_FINANCE));

export default route<TenantFinancePaySchema>("TenantFinancePaySchema",
  async (req, res) => {
    const info = await auth(req, res);
    if (!info) { return; }

    const client = getClient(ChargingServiceClient);

    return await asyncClientCall(client, "pay", {
      tenantName: req.body.tenantName,
      comment: req.body.comment ?? "",
      amount: numberToMoney(req.body.amount),
      operatorId: info.identityId,
      ipAddress: parseIp(req) ?? "",
      type: req.body.type,
    }).then((reply) => {
      const replyObj = ensureNotUndefined(reply, ["currentBalance"]);

      return { 200: { balance: moneyToNumber(replyObj.currentBalance) } };
    }).catch(handlegRPCError({
      [Status.NOT_FOUND]: () => ({ 404: null }),
    }));
  },
);
