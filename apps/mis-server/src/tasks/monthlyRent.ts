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
import { MikroORM, QueryOrder } from "@mikro-orm/core";
import { MariaDbDriver } from "@mikro-orm/mariadb";
import { SqlEntityManager } from "@mikro-orm/mysql";
import { parsePlaceholder } from "@scow/lib-config";
import { addJobCharge, charge } from "src/bl/charging";
import { emptyJobPriceInfo } from "src/bl/jobPrice";
import { clusterNameToScowClusterId } from "src/config/clusters";
import { misConfig } from "src/config/mis";
import { Account } from "src/entities/Account";
import { JobInfo } from "src/entities/JobInfo";
import { OriginalJob } from "src/entities/OriginalJob";
import { UserAccount } from "src/entities/UserAccount";
import { ClusterPlugin } from "src/plugins/clusters";
import { PricePlugin } from "src/plugins/price";

async function getLatestIndex(em: SqlEntityManager, logger: Logger) {

  const query = em.fork().createQueryBuilder(JobInfo)
    .select("biJobIndex")
    .orderBy({ biJobIndex: QueryOrder.DESC });

  const { biJobIndex = 0 } = (await query.execute("get")) ?? {};

  logger.info(`Latest biJobIndex from billing db is ${biJobIndex}.`);

  return biJobIndex;
}


export async function monthlyRent(
  em: SqlEntityManager,
  logger: Logger,
) {
  logger.info("Start monthly rent task.");

  const accounts = await em.find(Account, { }, { populate: ["tenant"]});

  const accountTenantMap = new Map(accounts.map((x) => [x.accountName, x.tenant.$.name]));


}
