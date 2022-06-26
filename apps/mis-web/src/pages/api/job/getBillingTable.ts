import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { authenticate } from "src/auth/server";
import { JobBillingTableItem } from "src/components/JobBillingTable";
import { JobBillingItem } from "src/generated/server/job";
import { PlatformRole } from "src/models/User";
import { getBillingItems } from "src/pages/api/job/getBillingItems";
import { publicConfig, runtimeConfig } from "src/utils/config";
import { moneyToString } from "src/utils/money";

export interface GetBillingTableSchema {
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


export async function getBillingTableItems(tenantName: string | undefined) {
  const items = await getBillingItems(tenantName, true);

  const pathItemMap = items.reduce((prev, curr) => {
    prev[curr.path] = curr;
    return prev;
  }, {} as Record<string, JobBillingItem>);

  let count = 0;
  const tableItems: JobBillingTableItem[] = [];
  const clusters = runtimeConfig.CLUSTERS_CONFIG;

  for (const [cluster, { partitions }] of Object.entries(clusters)) {
    const partitionCount = Object.keys(partitions).length;
    let clusterItemIndex = 0;
    for (const [partition, partitionInfo] of Object.entries(partitions)) {
      const qosCount = partitionInfo.qos?.length ?? 1;
      let partitionItemIndex = 0;
      for (const qos of partitionInfo.qos ?? [""]) {

        const path = [cluster, partition, qos].filter((x) => x).join(".");

        const item = pathItemMap[path];

        tableItems.push({
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
          itemId: item.id,
          price: moneyToString(item.price!),
          comment: partitionInfo.comment,
        });
      }
    }
  }

  return tableItems;

}

export default /* #__PURE__*/route<GetBillingTableSchema>("GetBillingTableSchema", async (req, res) => {
  const { tenant } = req.query;
  if (tenant) {
    const auth = authenticate((u) => u.platformRoles.includes(PlatformRole.PLATFORM_ADMIN) || (u.tenant === tenant));
    const info = await auth(req, res);
    if (!info) { return; }
  }

  const items = await getBillingTableItems(tenant);

  return { 200: { items } };
});
