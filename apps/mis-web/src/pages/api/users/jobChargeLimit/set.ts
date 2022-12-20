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
import { Status } from "@grpc/grpc-js/build/src/constants";
import { numberToMoney } from "@scow/lib-decimal";
import { JobChargeLimitServiceClient } from "@scow/protos/build/server/job_charge_limit";
import { authenticate } from "src/auth/server";
import { UserRole } from "src/models/User";
import { getClient } from "src/utils/client";
import { handlegRPCError } from "src/utils/server";

export interface SetJobChargeLimitSchema {
  method: "PUT",

  body: {
    accountName: string;
    userId: string;
    limit: number;
  }

  responses: {
    204: null;
    // 用户不存在
    404: null;
  }
}

export default /* #__PURE__*/route<SetJobChargeLimitSchema>("SetJobChargeLimitSchema", async (req, res) => {

  const { accountName, userId, limit } = req.body;

  const auth = authenticate((u) => u.accountAffiliations.some((x) =>
    x.accountName === accountName && x.role !== UserRole.USER));

  const info = await auth(req, res);

  if (!info) { return; }

  const client = getClient(JobChargeLimitServiceClient);

  return await asyncClientCall(client, "setJobChargeLimit", {
    tenantName: info.tenant,
    accountName, userId, limit: numberToMoney(limit),
  })
    .then(() => ({ 204: null }))
    .catch(handlegRPCError({
      [Status.NOT_FOUND]: () => ({ 404: null }),
    }));
});
