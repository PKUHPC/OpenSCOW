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
import { authenticate } from "src/auth/server";
import { ChargingServiceClient } from "src/generated/server/charging";
import { PlatformRole, TenantRole } from "src/models/User";
import { getClient } from "src/utils/client";

export interface GetUsedPayTypesSchema {
  method: "GET";

  responses: {
    200: {
      types: string[];
    }
  }
}

const auth = authenticate((u) =>
  u.tenantRoles.includes(TenantRole.TENANT_FINANCE) ||
  u.platformRoles.includes(PlatformRole.PLATFORM_FINANCE),
);

export default route<GetUsedPayTypesSchema>("GetUsedPayTypesSchema",
  async (req, res) => {


    const info = await auth(req, res);

    if (!info) { return; }

    const client = getClient(ChargingServiceClient);

    const { types } = await asyncClientCall(client, "getAllPayTypes", {});

    return { 200: { types } };

  });

