import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncClientCall } from "@ddadaal/tsgrpc-utils";
import { numberToMoney } from "@scow/lib-decimal";
import { USE_MOCK } from "src/apis/useMock";
import { authenticate } from "src/auth/server";
import { JobBillingTableItem } from "src/components/JobBillingTable";
import { GetBillingItemsReply, JobServiceClient } from "src/generated/server/job";
import { PlatformRole } from "src/models/User";
import { getClient } from "src/utils/client";
import { publicConfig, runtimeConfig } from "src/utils/config";
import { moneyToString } from "src/utils/money";

export interface GetBillingItemsSchema {
  method: "GET";

  query: {
    /**
     * Platform admin can query any tenant
     * Not login user can only query default (by not setting the tenant field)
     * Login user can only query the default and tenant the user belongs to
     */
    tenant?: string;
  }

  responses: {
    200: { items: JobBillingTableItem[];};
  }
}

const mockBillingItems = {
  "hpc01.compute.low": numberToMoney(0.04),
  "hpc01.compute.normal": numberToMoney(0.06),
  "hpc01.compute.high": numberToMoney(0.08),
  "hpc01.GPU.low": numberToMoney(10.00),
  "hpc01.GPU.normal": numberToMoney(12.00),
  "hpc01.GPU.high": numberToMoney(14.00),
};

async function mockReply(): Promise<GetBillingItemsReply> {
  return { items: mockBillingItems };
}


export async function getBillingTableItems(tenantName?: string) {
  const client = getClient(JobServiceClient);
  const reply = USE_MOCK ? await mockReply() : await asyncClientCall(client, "getBillingItems", { tenantName });

  let count = 0;
  const items: JobBillingTableItem[] = [];
  const clusters = runtimeConfig.CLUSTERS_CONFIG;

  for (const [cluster, { partitions }] of Object.entries(clusters)) {
    const partitionCount = Object.keys(partitions).length;
    let clusterItemIndex = 0;
    for (const [partition, partitionInfo] of Object.entries(partitions)) {
      const qosCount = partitionInfo.qos?.length ?? 1;
      let partitionItemIndex = 0;
      for (const qos of partitionInfo.qos ?? [""]) {

        const path = [cluster, partition, qos].filter((x) => x).join(".");

        items.push({
          index: count++,
          clusterItemIndex: clusterItemIndex++,
          partitionItemIndex: partitionItemIndex++,
          cluster: publicConfig.CLUSTERS[cluster] ?? cluster,
          cores: partitionInfo.cores,
          gpus: partitionInfo.gpus,
          mem: partitionInfo.mem,
          nodes: partitionInfo.nodes,
          partition,
          partitionCount,
          qosCount,
          qos,
          price: moneyToString(reply.items[path]),
          comment: partitionInfo.comment,
        });
      }
    }
  }
  return items;

}

export default /* #__PURE__*/route<GetBillingItemsSchema>("GetBillingItemsSchema", async (req, res) => {
  const { tenant } = req.query;
  if (tenant) {
    const auth = authenticate((u) => u.platformRoles.includes(PlatformRole.PLATFORM_ADMIN) || (u.tenant === tenant));
    const info = await auth(req, res);
    if (!info) { return; }
  }

  const items = await getBillingTableItems(tenant);

  return { 200: { items } };
});
