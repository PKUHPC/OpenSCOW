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
import { AdminServiceClient, ChangeStorageQuotaMode } from "src/generated/server/admin";
import { TenantRole } from "src/models/User";
import { getClient } from "src/utils/client";
import { handlegRPCError } from "src/utils/server";

export type ChangeStorageMode =
  | "INCREASE"
  | "DECREASE"
  | "SET";


export interface ChangeStorageQuotaSchema {
  method: "PUT";

  body: {
    cluster: string;
    userId: string;

    mode: ChangeStorageMode;

    /**
     * @minimum 0
     * @type integer
     */
    value: number;

  }

  responses: {
    200: {
      currentQuota: number;
    }

    400: {
      code: "DELTA_NOT_VALID";
    }

    404: null;
  }
}

const auth = authenticate((info) => info.tenantRoles.includes(TenantRole.TENANT_ADMIN));

export default route<ChangeStorageQuotaSchema>("ChangeStorageQuotaSchema",
  async (req, res) => {

    const info = await auth(req, res);
    if (!info) {
      return;
    }

    const { mode, value, userId, cluster } = req.body;

    const client = getClient(AdminServiceClient);

    return await asyncClientCall(client, "changeStorageQuota", {
      mode: ChangeStorageQuotaMode[mode],
      value,
      cluster,
      userId,
    })
      .then(({ currentQuota }) => ({ 200: { currentQuota } }))
      .catch(handlegRPCError({
        [Status.INVALID_ARGUMENT]: () => ({ 400: { code: "DELTA_NOT_VALID" as const } }),
        [Status.NOT_FOUND]: () => ({ 404: null }),
      }));
  });
