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
import { DEFAULT_CONFIG_BASE_PATH } from "@scow/config/build/constants";
// import { ClusterConfigSchema } from "@scow/config/build/cluster";
import { Decimal } from "@scow/lib-decimal";
import { Partition } from "@scow/scheduler-adapter-protos/build/protos/config";
import { join } from "path";
import { JobInfo, PriceMap } from "src/bl/PriceMap";
import { clusters } from "src/config/clusters";
import { misConfig } from "src/config/mis";
import { JobPriceInfo } from "src/entities/JobInfo";
import { AmountStrategy, JobPriceItem } from "src/entities/JobPriceItem";
import { logger } from "src/utils/logger";

// import { } from "../../../../dev/vagrant/config/scripts/my-strategy.js";

// type Partition = ClusterConfigSchema["slurm"]["partitions"][number];

type AmountStrategyFunc = (info: JobInfo, partition: Partition) => Decimal;
type CustomAmountStrategyFunc = (info: JobInfo) => number;
const customAmountStrategyFuncs: Record<string, CustomAmountStrategyFunc> = {};
logger.info("customAmountStrategyFuncs %o", customAmountStrategyFuncs);
if (Array.isArray(misConfig.customAmountStrategies)) {
  try {
    for (const item of misConfig.customAmountStrategies) {
      customAmountStrategyFuncs[item.id] = require(join(DEFAULT_CONFIG_BASE_PATH, "scripts", item.script));
      logger.info("customAmountStrategyFuncs %s", customAmountStrategyFuncs[item.id]({
        timeUsed: 200,
        jobId: 0,
        cluster: "",
        partition: "",
        qos: "",
        cpusAlloc: 0,
        gpu: 0,
        memReq: 0,
        memAlloc: 0,
        account: "",
        tenant: "",
      }));
    }

  } catch (error) {
    logger.error(error);
  }
}

const amountStrategyFuncs: Record<AmountStrategy, AmountStrategyFunc> = {
  [AmountStrategy.GPU]: (info) => new Decimal(info.gpu),
  [AmountStrategy.CPUS_ALLOC]: (info) => new Decimal(info.cpusAlloc),
  [AmountStrategy.MAX_GPU_CPUSALLOC]: (info, partition) => {
    const { gpu, cpusAlloc } = info;
    const { cores, gpus } = partition;
    return Decimal.max(
      gpu,
      new Decimal(cpusAlloc).div(
        new Decimal(cores).div(gpus),
      ).integerValue(Decimal.ROUND_CEIL),
    );
  },
  [AmountStrategy.MAX_CPUSALLOC_MEM]: (info, partition) => {

    const { memMb, cores } = partition;
    return Decimal.max(
      // 核心数
      info.cpusAlloc,

      // 申请内存总数/(分区内容/分区核心数)
      new Decimal(info.memReq).div(
        new Decimal(memMb).div(cores),
      ).integerValue(Decimal.ROUND_CEIL),
    );
  },

};


export function calculateJobPrice(
  partitionsForClusters: Record<string, Partition[]>,
  info: JobInfo, getPriceItem: PriceMap["getPriceItem"],
  logger: Logger): JobPriceInfo {

  logger.trace(`Calculating price for job ${info.jobId} in cluster ${info.cluster}`);

  const clusterInfo = clusters[info.cluster];

  if (!clusterInfo) {
    logger.warn(`Unknown cluster ${info.cluster}`);
    return emptyJobPriceInfo();
  }

  const partitionInfo = partitionsForClusters[info.cluster].find((x) => x.name === info.partition);
  if (!partitionInfo) {
    logger.warn(`Unknown partition ${info.partition} of cluster ${info.cluster}`);
    return emptyJobPriceInfo();
  }

  const path = [info.cluster, info.partition, info.qos] as [string, string, string];

  function calculatePrice(priceItem: JobPriceItem, partition: Partition) {
    const time = new Decimal(info.timeUsed).div(3600); // 秒到小时

    const amountFn = amountStrategyFuncs[priceItem.amount] || customAmountStrategyFuncs[priceItem.amount];

    let amount = amountFn ? new Decimal(amountFn(info, partition)) : new Decimal(0);

    if (!amountFn) {
      logger.warn("Unknown AmountStrategy %s. Count as 0.", priceItem.amount);
    }

    amount = amount.multipliedBy(time);

    amount = amount.decimalPlaces(3, Decimal.ROUND_DOWN);

    return priceItem.price.multipliedBy(amount).decimalPlaces(3, Decimal.ROUND_HALF_CEIL);
  }
  const accountBase = getPriceItem(path, info.tenant);
  const tenantBase = getPriceItem(path);

  const accountPrice = calculatePrice(accountBase, partitionInfo);
  const tenantPrice = calculatePrice(tenantBase, partitionInfo);

  return {
    tenant: { billingItemId: tenantBase.itemId, price: tenantPrice },
    account: { billingItemId: accountBase.itemId, price: accountPrice },
  };
}

export const emptyJobPriceInfo = (): JobPriceInfo => ({ tenant: undefined, account: undefined });
