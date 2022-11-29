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
import { numberToMoney } from "@scow/lib-decimal";
import { USE_MOCK } from "src/apis/useMock";
import { authenticate } from "src/auth/server";
import { GetBillingItemsReply, JobServiceClient } from "src/generated/server/job";
import { PlatformRole } from "src/models/User";
import { getClient } from "src/utils/client";

export interface GetBillingItemsSchema {
  method: "GET";

  query: {
    /**
     * Platform admin can query any tenant
     * Not login user can only query platform default (by not setting the tenant field)
     * Login user can only query the platform default and tenant the user belongs to
     */
    tenant?: string;

    /**
     * If only returns active billing items
     */
    activeOnly: boolean;
  }

  responses: {
    200: GetBillingItemsReply;
  }
}

const mockBillingItems = [
  { id: "HPC01", path: "hpc01.compute.low", price: numberToMoney(0.04), amountStrategy: "gpu" },
  { id: "HPC02", path: "hpc01.compute.normal", price: numberToMoney(0.06), amountStrategy: "gpu" },
  { id: "HPC03", path: "hpc01.compute.high", price: numberToMoney(0.08), amountStrategy: "gpu" },
  { id: "HPC04", path: "hpc01.GPU.low", price: numberToMoney(10.00), amountStrategy: "gpu" },
  { id: "HPC05", path: "hpc01.GPU.normal", price: numberToMoney(12.00), amountStrategy: "gpu" },
  { id: "HPC06", path: "hpc01.GPU.high", price: numberToMoney(14.00), amountStrategy: "gpu" },
];

async function mockReply(): Promise<GetBillingItemsReply> {
  return { items: mockBillingItems };
}

export async function getBillingItems(tenantName: string | undefined, activeOnly: boolean) {

  const client = getClient(JobServiceClient);
  const reply = USE_MOCK
    ? await mockReply()
    : await asyncClientCall(client, "getBillingItems", { tenantName, activeOnly });

  return reply.items;
}


export default /* #__PURE__*/route<GetBillingItemsSchema>("GetBillingItemsSchema", async (req, res) => {
  const { tenant, activeOnly } = req.query;

  if (tenant) {
    const auth = authenticate((u) => u.platformRoles.includes(PlatformRole.PLATFORM_ADMIN) || (u.tenant === tenant));
    const info = await auth(req, res);
    if (!info) { return; }
  }

  const items = await getBillingItems(tenant, activeOnly);

  return { 200: { items } };
});
