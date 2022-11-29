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
import { authenticate } from "src/auth/server";
import { AccountServiceClient } from "src/generated/server/account";
import { TenantRole } from "src/models/User";
import { getClient } from "src/utils/client";
import { handleGrpcClusteropsError, InternalErrorInfo } from "src/utils/internalError";
import { handlegRPCError } from "src/utils/server";

export interface DewhitelistAccountSchema {
  method: "DELETE";

  body: {
    accountName: string;
  }

  responses: {
    204: null;
    404: null;
    500: InternalErrorInfo;
  }
}

const auth = authenticate((info) => info.tenantRoles.includes(TenantRole.TENANT_ADMIN));

export default route<DewhitelistAccountSchema>("DewhitelistAccountSchema",
  async (req, res) => {

    const info = await auth(req, res);
    if (!info) { return; }

    const { accountName } = req.body;

    const client = getClient(AccountServiceClient);

    return await asyncClientCall(client, "dewhitelistAccount", {
      tenantName: info.tenant,
      accountName,
    })
      .then(() => ({ 204: null }))
      .catch(handlegRPCError({
        [Status.INTERNAL]: handleGrpcClusteropsError,
        [Status.NOT_FOUND]: () => ({ 404: null }),
      }));
  });
