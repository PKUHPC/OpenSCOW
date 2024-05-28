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

import { typeboxRoute, typeboxRouteSchema } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncClientCall } from "@ddadaal/tsgrpc-client";
import { numberToMoney } from "@scow/lib-decimal";
import { ConfigServiceClient } from "@scow/protos/build/common/config";
import { GetBillingItemsResponse, JobBillingItem, JobServiceClient } from "@scow/protos/build/server/job";
import { Static, Type } from "@sinclair/typebox";
import { USE_MOCK } from "src/apis/useMock";
import { authenticate } from "src/auth/server";
import { PlatformRole } from "src/models/User";
import { Money } from "src/models/UserSchemaModel";
import { getClient } from "src/utils/client";

// Cannot use BillingItemType from pageComponents/job/ManageJobBillingTable
export const BillingItemType = Type.Object({
  cluster: Type.String(),
  partition: Type.String(),
  qos: Type.String(),
  tenantName: Type.Optional(Type.String()),

  priceItem: Type.Optional(
    Type.Object({
      itemId: Type.String(),
      price: Money,
      amountStrategy: Type.String(),
    })),
});
export type BillingItemType = Static<typeof BillingItemType>;

export const GetBillingItemsSchema = typeboxRouteSchema({
  method: "GET",

  query: Type.Object({
    /**
     * Platform admin can query any tenant
     * Not login user can only query platform default (by not setting the tenant field)
     * Login user can only query the platform default and tenant the user belongs to
     */
    tenant: Type.Optional(Type.String()),

    /**
     * If only returns active billing items
     */
    activeOnly: Type.Boolean(),

    /**
     * currently activated cluster ids only
     */
    currentActivatedClusterIds: Type.Optional(Type.Array(Type.String())),

    clusterSortedIdList: Type.Array(Type.String()),

  }),

  responses: {
    200: Type.Object({
      activeItems: Type.Array(BillingItemType),
      historyItems: Type.Array(BillingItemType),

      /**
       * next item id for this tenant
       */
      nextId: Type.String(),
    }),
  },
});

const mockBillingItems = [
  { id: "HPC01", path: "hpc01.compute.low", price: numberToMoney(0.04), amountStrategy: "gpu" },
  { id: "HPC02", path: "hpc01.compute.normal", price: numberToMoney(0.06), amountStrategy: "gpu" },
  { id: "HPC03", path: "hpc01.compute.high", price: numberToMoney(0.08), amountStrategy: "gpu" },
  { id: "HPC04", path: "hpc01.GPU.low", price: numberToMoney(10.00), amountStrategy: "gpu" },
  { id: "HPC05", path: "hpc01.GPU.normal", price: numberToMoney(12.00), amountStrategy: "gpu" },
  { id: "HPC06", path: "hpc01.GPU.high", price: numberToMoney(14.00), amountStrategy: "gpu" },
];

const mockHistoryBillingItems = [
  { id: "HPC00", path: "hpc01.compute.low", price: numberToMoney(0.02), amountStrategy: "gpu" },
];

async function mockReply(): Promise<GetBillingItemsResponse> {
  return { activeItems: mockBillingItems, historyItems: mockHistoryBillingItems };
}

export async function getBillingItems(tenantName: string | undefined, activeOnly: boolean) {

  const client = getClient(JobServiceClient);
  const reply = USE_MOCK
    ? await mockReply()
    : await asyncClientCall(client, "getBillingItems", { tenantName, activeOnly });

  return reply;
}

const calculateNextId = (data?: JobBillingItem[], tenant?: string) => {
  const currentItemIds = data
    ? data.filter((x) => x.tenantName === tenant).map((x) => x.id) : [];
  if (!tenant) {
    const nums = currentItemIds.map((x) => parseInt(x)).filter((x) => !isNaN(x));
    return (nums.length === 0 ? 1 : Math.max(...nums) + 1).toString();
  }
  else {
    const flag = tenant + "_";
    const nums = currentItemIds
      .filter((x) => x.startsWith(flag))
      .map((x) => parseInt(x.replace(flag, "")))
      .filter((x) => !isNaN(x));
    return tenant + "_" + (nums.length === 0 ? 1 : Math.max(...nums) + 1);
  }
};


export default /* #__PURE__*/typeboxRoute(GetBillingItemsSchema, async (req, res) => {
  const { tenant, activeOnly, currentActivatedClusterIds, clusterSortedIdList } = req.query;

  if (tenant) {
    const auth = authenticate((u) => u.platformRoles.includes(PlatformRole.PLATFORM_ADMIN) || (u.tenant === tenant));
    const info = await auth(req, res);
    if (!info) { return; }
  }

  const reply = await getBillingItems(tenant, activeOnly);

  const nextId = calculateNextId(reply.activeItems, tenant);

  const sourceToBillingItemType = (item: JobBillingItem) => {
    const priceItem = item.path.split(".");
    return {
      cluster: priceItem[0],
      partition: priceItem[1],
      qos: priceItem[2],
      tenantName: item.tenantName,
      priceItem: {
        itemId: item.id,
        price: item.price!,
        amountStrategy: item.amountStrategy,
      },
    } as BillingItemType;
  };

  const result = { activeItems: [] as BillingItemType[], historyItems: [] as BillingItemType[], nextId };

  const sortedIds = clusterSortedIdList.filter((id) => currentActivatedClusterIds?.includes(id));
  if (sortedIds.length === 0) { console.info("Cluster ops failed , error details: No available clusters"); }

  for (const cluster of sortedIds) {

    const client = getClient(ConfigServiceClient);

    const partitions = await asyncClientCall(client, "getClusterConfig", { cluster }).then((resp) => {
      return resp.partitions;
    }).catch((e) => {
      console.log(`Cluster ops fails at ${cluster}, error details: ${e}`);
      return [];
    });

    for (const partition of partitions) {
      for (const qos of partition.qos ?? [""]) {
        const path = [cluster, partition.name, qos].filter((x) => x).join(".");
        const pathItem = reply.activeItems.find((item) => item.path === path);
        result.activeItems.push(pathItem ? sourceToBillingItemType(pathItem) : {
          cluster, partition: partition.name, qos, tenantName: undefined,
        });
      }
    }
  }

  result.historyItems = reply.historyItems.filter((item) => item.tenantName === tenant).map(sourceToBillingItemType);

  return { 200: result };
});
