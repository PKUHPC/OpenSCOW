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
import { JobBillingItem } from "@scow/protos/build/server/job";
import { Static, Type } from "@sinclair/typebox";
import { authenticate } from "src/auth/server";
import { PlatformRole } from "src/models/User";
import { getBillingItems } from "src/pages/api/job/getBillingItems";
import { publicConfig, runtimeConfig } from "src/utils/config";
import { moneyToString } from "src/utils/money";

// Cannot use JobBillingTableItem from /components/JobBillingTable
export const JobBillingTableItem = Type.Object({
  index: Type.Number(),

  cluster: Type.String(),
  clusterItemIndex: Type.Number(),
  priceItem: Type.Optional(Type.Object({
    itemId: Type.String(),
    price: Type.String(),
    amount: Type.String(),
  })),

  partition: Type.String(),
  partitionCount: Type.Number(),

  partitionItemIndex: Type.Number(),

  qos: Type.String(),
  qosCount: Type.Number(),
  nodes: Type.Number(),
  mem: Type.Number(),
  cores: Type.Number(),
  gpus: Type.Number(),
  path: Type.String(),
  comment: Type.Optional(Type.String()),

});
export type JobBillingTableItem = Static<typeof JobBillingTableItem>;

export const GetBillingTableSchema = typeboxRouteSchema({
  method: "GET",

  query: Type.Object({
    /**
     * Platform admin can query any tenant
     * Not login user can only query platform default (by not setting the tenant field)
     * Login user can only query the platform default and tenant the user belongs to
     */
    tenant: Type.Optional(Type.String()),
  }),

  responses: Type.Object({
    200: Type.Object({ items: JobBillingTableItem }),
  }),
});


export async function getBillingTableItems(tenantName: string | undefined) {
  const items = (await getBillingItems(tenantName, true)).activeItems;

  const pathItemMap = items.reduce((prev, curr) => {
    prev[curr.path] = curr;
    return prev;
  }, {} as Record<string, JobBillingItem>);

  let count = 0;
  const tableItems: JobBillingTableItem[] = [];
  const clusters = runtimeConfig.CLUSTERS_CONFIG;

  for (const [cluster, { slurm: { partitions } }] of Object.entries(clusters)) {
    const partitionCount = partitions.length;
    let clusterItemIndex = 0;
    for (const partition of partitions) {
      const qosCount = partition.qos?.length ?? 1;
      let partitionItemIndex = 0;
      for (const qos of partition.qos ?? [""]) {

        const path = [cluster, partition.name, qos].filter((x) => x).join(".");

        const item = pathItemMap[path];

        tableItems.push({
          index: count++,
          clusterItemIndex: clusterItemIndex++,
          partitionItemIndex: partitionItemIndex++,
          cluster: publicConfig.CLUSTERS[cluster]?.name ?? cluster,
          cores: partition.cores,
          gpus: partition.gpus,
          mem: partition.mem,
          nodes: partition.nodes,
          partition: partition.name,
          partitionCount,
          qosCount,
          qos,
          priceItem: item ? {
            amount: item.amountStrategy,
            itemId: item.id,
            price: moneyToString(item.price!),
          } : undefined,
          path,
          comment: partition.comment,
        });
      }
    }
  }

  return tableItems;

}

export default /* #__PURE__*/typeboxRoute(GetBillingTableSchema, async (req, res) => {
  const { tenant } = req.query;

  if (tenant) {
    const auth = authenticate((u) => u.platformRoles.includes(PlatformRole.PLATFORM_ADMIN) || (u.tenant === tenant));
    const info = await auth(req, res);
    if (!info) { return; }
  }

  const items = await getBillingTableItems(tenant);

  return { 200: { items } };
});
