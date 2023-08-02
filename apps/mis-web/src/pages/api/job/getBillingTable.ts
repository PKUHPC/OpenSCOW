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
import { ConfigServiceClient } from "@scow/protos/build/common/config";
import { ConfigServiceClient as MisConfigServerClient } from "@scow/protos/build/server/config";
import { JobBillingItem } from "@scow/protos/build/server/job";
import { Static, Type } from "@sinclair/typebox";
import { authenticate } from "src/auth/server";
import { PlatformRole } from "src/models/User";
import { getBillingItems } from "src/pages/api/job/getBillingItems";
import { getClient } from "src/utils/client";
import { publicConfig, runtimeConfig } from "src/utils/config";
import { moneyToString } from "src/utils/money";

import { getUserStatus } from "../dashboard/status";

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

export const Partition = Type.Object({
  name: Type.String(),
  memMb: Type.Number(),
  cores: Type.Number(),
  gpus: Type.Number(),
  nodes: Type.Number(),
  qos: Type.Optional(Type.Array(Type.String())),
  comment: Type.Optional(Type.String()),
});
export type Partition = Static<typeof Partition>;

export const ClusterPartitions = Type.Object({
  cluster: Type.String(),
  partitions: Type.Array(Partition),
});
export type ClusterPartitions = Static<typeof ClusterPartitions>;


// get type from value of libs/config/src/clusterTexts.ts/ClusterTextsConfigSchema
export const ClusterText = Type.Object({
  clusterComment:Type.Optional(Type.String()),
  extras: Type.Optional(Type.Array(Type.Object({
    title: Type.String(),
    content: Type.String(),
  }))),
});
export type ClusterText = Static<typeof ClusterText>;

export const GetBillingTableSchema = typeboxRouteSchema({
  method: "GET",

  query: Type.Object({
    tenant: Type.Optional(Type.String()),
    userId: Type.Optional(Type.String()),
  }),

  responses: {
    200: Type.Object({
      items: Type.Array(JobBillingTableItem),
      text: Type.Optional(ClusterText),
    }),
  },
});

export async function getAvailablePartitionForItems(
  userId: string, tenantName: string): Promise<{[cluster: string]: Partition[]}> {

  const client = getClient(MisConfigServerClient);

  const statuses = await getUserStatus(userId, tenantName);
  const accountNames = Object.keys(statuses.accountStatuses).filter(
    (key) => !statuses.accountStatuses[key].accountBlocked);

  if (!accountNames) { return {}; }

  const clusterPartitionsMap: { [cluster: string]: Partition[] } = {};
  for (const accountName of accountNames) {

    const availableCPs = await asyncClientCall(client, "getAvailablePartitions",
      { accountName: accountName, userId: userId }).then((resp) => {
      return resp.clusterPartitions;
    });
    availableCPs.forEach((cp) => {

      const cluster = cp.cluster;
      if (!(cluster in clusterPartitionsMap)) {
        clusterPartitionsMap[cluster] = [];
      };
      if (cp.partitions) {
        clusterPartitionsMap[cluster] = clusterPartitionsMap[cluster].concat(cp.partitions);
      }
    });
  }

  for (const cluster of Object.keys(clusterPartitionsMap)) {
    clusterPartitionsMap[cluster] = removeDuplicatesByPName(clusterPartitionsMap[cluster]);
  }

  return clusterPartitionsMap;
};

const removeDuplicatesByPName = (partitions: Partition[]): Partition[] => {
  const uniquePartitions: Partition[] = [];
  const partitionNames = new Set();
  partitions.forEach((partition) => {
    if (!partitionNames.has(partition?.name)) {
      uniquePartitions.push(partition);
      partitionNames.add(partition?.name);
    }
  });
  return uniquePartitions;
};

export async function getBillingTableItems(
  tenantName: string | undefined, userId?: string | undefined): Promise<JobBillingTableItem[]> {
  const items = (await getBillingItems(tenantName, true)).activeItems;

  const pathItemMap = items.reduce((prev, curr) => {
    prev[curr.path] = curr;
    return prev;
  }, {} as Record<string, JobBillingItem>);

  let count = 0;
  const tableItems: JobBillingTableItem[] = [];
  const clusters = runtimeConfig.CLUSTERS_CONFIG;

  const client = getClient(ConfigServiceClient);

  const clusterPartitions = userId && tenantName ? await getAvailablePartitionForItems(userId, tenantName) : {};

  for (const [cluster] of Object.entries(clusters)) {

    const partitions = userId ? clusterPartitions[cluster] ?? []
      : await asyncClientCall(client, "getClusterConfig", { cluster }).then((resp) => resp.partitions);

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
          mem: partition.memMb,
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
  const { tenant, userId } = req.query;

  const auth = authenticate(() => true);
  const info = await auth(req, res);
  if (!info) { return; }

  const clusterTexts = runtimeConfig.CLUSTER_TEXTS_CONFIG;
  const text = clusterTexts && tenant ? (clusterTexts[tenant] ?? clusterTexts.default) : undefined;

  const items = await getBillingTableItems(tenant, userId);

  return { 200: { items, text } };
});
