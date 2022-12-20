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
import { status } from "@grpc/grpc-js";
import { Money } from "@scow/protos/build/common/money";
import { JobServiceClient } from "@scow/protos/build/server/job";
import { authenticate } from "src/auth/server";
import { AmountStrategy } from "src/models/job";
import { PlatformRole, TenantRole } from "src/models/User";
import { getClient } from "src/utils/client";
import { queryIfInitialized } from "src/utils/init";
import { handlegRPCError } from "src/utils/server";

export interface AddBillingItemSchema {
  method: "POST";

  body: {
    // if not set, add to platform default
    tenant?: string;

    itemId: string;
    price: Money;
    amount: string;
    path: string;
    description?: string;
  }

  responses: {
    204: null;
    409: { code: "ITEM_ID_EXISTS" };
    404: { code: "TENANT_NOT_FOUND"};
    400: { code: "INVALID_AMOUNT" };
  }
}

export default /* #__PURE__*/route<AddBillingItemSchema>("AddBillingItemSchema", async (req, res) => {
  const { tenant, amount, itemId, path, price, description } = req.body;

  if (await queryIfInitialized()) {
    // Platform admin can add to every tenant
    // only tenant admin can add to its own tenant
    // if tenant is undefined, no user's tenant === undefined so only platform admin can edit default price items
    const auth = authenticate((u) =>
      u.platformRoles.includes(PlatformRole.PLATFORM_ADMIN)
       || (u.tenant === tenant && u.tenantRoles.includes(TenantRole.TENANT_ADMIN)),
    );
    const info = await auth(req, res);
    if (!info) { return; }
  }

  if (!(Object.values(AmountStrategy) as string[]).includes(amount)) {
    return { 400: { code: "INVALID_AMOUNT" } as const };
  }

  const client = getClient(JobServiceClient);

  return await asyncClientCall(client, "addBillingItem", {
    tenantName: tenant, amountStrategy: amount, itemId, path, description, price,
  })
    .then(() => ({ 204: null }))
    .catch(handlegRPCError({
      [status.ALREADY_EXISTS]: () => ({ 409: { code: "ITEM_ID_EXISTS" } } as const),
      [status.NOT_FOUND]: () => ({ 404: { code: "TENANT_NOT_FOUND" } } as const),
    }));
});
