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
import { ServiceError } from "@grpc/grpc-js";
import { ConfigServiceClient as MisConfigServerClient } from "@scow/protos/build/server/config";
import { JobBillingItem } from "@scow/protos/build/server/job";
import { UserStatus } from "@scow/protos/build/server/user";
import { parseErrorDetails } from "@scow/rich-error-model";
import { Static, Type } from "@sinclair/typebox";
import { authenticate } from "src/auth/server";
import { getBillingItems } from "src/pages/api/job/getBillingItems";
import { getClient } from "src/utils/client";
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

export const GetAvailableBillingTableSchema = typeboxRouteSchema({
  method: "GET",

  query: Type.Object({
    cluster: Type.String(),
    tenant: Type.Optional(Type.String()),
    userId: Type.Optional(Type.String()),
  }),

  responses: {
    200: Type.Object({
      items: Type.Array(JobBillingTableItem),
    }),

    /** 用户或账户存在问题 */
    409: Type.Object({
      code: Type.Literal("ACCOUNT_OR_USER_ERROR"),
      message: Type.Optional(Type.String()),
    }),
  },
});

export async function getAvailablePartitionForItems(
  cluster: string, userId: string, tenantName: string): Promise<Partition[]> {

  const client = getClient(MisConfigServerClient);

  const statuses = await getUserStatus(userId, tenantName);

  const accountNames = Object.keys(statuses.accountStatuses).filter(
    (key) => (!statuses.accountStatuses[key].accountBlocked
      && statuses.accountStatuses[key].userStatus !== UserStatus.BLOCKED));

  if (!accountNames) { return []; }

  const partitions: Partition[] = [];

  await Promise.all(accountNames
    .map(async (accountName) => {

      const resp = await asyncClientCall(client, "getAvailablePartitions",
        { cluster, accountName, userId }).then((resp) => {
        return resp;
      });
      partitions.push(...resp.partitions);
    }));

  const result = removeDuplicatesByPName(partitions);

  return result;
}

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

export async function getAvailableBillingTableItems(
  cluster: string,
  tenantName: string | undefined,
  userId: string | undefined): Promise<JobBillingTableItem[]> {
  const items = (await getBillingItems(tenantName, true)).activeItems;

  const pathItemMap = items.reduce((prev, curr) => {
    prev[curr.path] = curr;
    return prev;
  }, {} as Record<string, JobBillingItem>);

  let count = 0;
  const tableItems: JobBillingTableItem[] = [];

  const partitions = tenantName && userId ?
    await getAvailablePartitionForItems(cluster, userId, tenantName) : [];

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
        cluster: cluster,
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

  return tableItems;

}

export default /* #__PURE__*/typeboxRoute(GetAvailableBillingTableSchema, async (req, res) => {
  const { cluster, tenant, userId } = req.query;
  const auth = authenticate(() => true);
  const info = await auth(req, res);
  if (!info) { return; }

  return await getAvailableBillingTableItems(cluster, tenant, userId)
    .then((items) => {
      return { 200: { items } };
    })
    .catch((e) => {
      const ex = e as ServiceError;
      const errors = parseErrorDetails(ex.metadata);
      if (errors[0] && errors[0].$type === "google.rpc.ErrorInfo") {
        switch (errors[0].reason) {
        case "ACCOUNT_NOT_FOUND":
          return { 409: {
            code: "ACCOUNT_OR_USER_ERROR" as const,
            message: `Error occurred in ${cluster}. ${ex.details}` } };
        case "USER_NOT_FOUND":
          return { 409: {
            code: "ACCOUNT_OR_USER_ERROR" as const,
            message: `Error occurred in ${cluster}. ${ex.details}` } };
        case "USER_ACCOUNT_NOT_FOUND":
          return { 409: {
            code: "ACCOUNT_OR_USER_ERROR" as const,
            message: `Error occurred in ${cluster}. ${ex.details}` } };
        default:
          return e;
        }
      } else {
        throw e;
      }
    });

});
