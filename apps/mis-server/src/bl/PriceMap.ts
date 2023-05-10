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

import { Logger } from "@ddadaal/tsgrpc-server";
import { MySqlDriver, SqlEntityManager } from "@mikro-orm/mysql";
import { Partition } from "@scow/scheduler-adapter-protos/build/protos/config";
import { calculateJobPrice } from "src/bl/jobPrice";
import { clusters } from "src/config/clusters";
import { JobPriceInfo } from "src/entities/JobInfo";
import { JobPriceItem } from "src/entities/JobPriceItem";

export interface JobInfo {
  biJobIndex: number;
  // scow cluster id
  cluster: string;
  partition: string;
  qos: string;
  timeUsed: number;
  cpusAlloc: number;
  gpu: number;
  memReq: number;
  memAlloc: number;
  account: string;
  tenant: string;
}

export interface PriceMap {
  // path: [cluster, partition, qos]
  getPriceItem(path: [string, string, string], tenantName?: string): JobPriceItem;
  getPriceMap(tenantName?: string): Record<string, JobPriceItem>;

  calculatePrice(info: JobInfo): JobPriceInfo;

  getMissingDefaultPriceItems(): string[];
}


export async function createPriceMap(
  em: SqlEntityManager<MySqlDriver>,
  partitionsForClusters: Record<string, Partition[]>,
  logger: Logger,
): Promise<PriceMap> {
  // get all billing items
  // order by ASC so that items added later overrides items added before.
  const billingItems = await em.find(JobPriceItem, {}, {
    populate: ["tenant"],
    orderBy: { createTime: "ASC" },
  });

  const { defaultPrices, tenantSpecificPrices } = getActiveBillingItems(billingItems);

  logger.info("Default Price Map: %o", defaultPrices);
  logger.info("Tenant specific prices %o", tenantSpecificPrices);

  const getPriceItem = (path: [string, string, string], tenantName?: string) => {

    const [cluster, partition, qos] = path;

    if (tenantName && tenantName in tenantSpecificPrices) {
      const specific = tenantSpecificPrices[tenantName][[cluster, partition, qos].join(".")] ||
        tenantSpecificPrices[tenantName][[cluster, partition].join(".")];

      if (specific) { return specific; }
    }

    const price = defaultPrices[[cluster, partition, qos].join(".")] ||
        defaultPrices[[cluster, partition].join(".")];

    if (!price) {
      throw new Error(`Unknown cluster ${cluster} partition ${partition} qos ${qos}`);
    }

    return price;
  };

  return {

    calculatePrice: (info) => calculateJobPrice(partitionsForClusters, info, getPriceItem, logger),

    getMissingDefaultPriceItems: () => {

      const missingPaths = [] as string[];

      for (const cluster in clusters) {
        for (const partition of partitionsForClusters[cluster]) {
          const path = [cluster, partition.name];

          const { qos } = partition;

          if (path.join(".") in defaultPrices) {
            continue;
          }

          if (Array.isArray(qos)) {
            qos.forEach((q) => {
              const newPath = [...path, q].join(".");
              if (!(newPath in defaultPrices)) {
                missingPaths.push(newPath);
              }
            });
          } else {
            missingPaths.push(path.join("."));
          }
        }
      }

      return missingPaths;
    },

    getPriceMap: (tenantName) => {
      return {
        ...defaultPrices,
        ...(tenantName) ? tenantSpecificPrices[tenantName] : undefined,
      };
    },

    getPriceItem,
  };
}

export function getActiveBillingItems(items: JobPriceItem[]) {
  // { [cluster.partition[.qos]]: price }
  const defaultPrices: Record<string, JobPriceItem> = {};
  // { tenantName: { [cluster.partition[.qos] ]: price }}
  const tenantSpecificPrices: Record<string, Record<string, JobPriceItem>> = {};

  items.forEach((item) => {
    if (!item.tenant) {
      defaultPrices[item.path.join(".")] = item;
    } else {
      const tenantName = item.tenant.getProperty("name");
      if (!(tenantName in tenantSpecificPrices)) {
        tenantSpecificPrices[tenantName] = {};
      }
      tenantSpecificPrices[tenantName][item.path.join(".")] = item;
    }
  });

  return { defaultPrices, tenantSpecificPrices };
}

