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
import { getChargeRecordsTotalCountCached,getJobTotalCountCached, getTotalStatisticsInfoCached } from "src/utils/cache";

export let lastFetched: Date | null = null;

export async function fetchStatistics(
  em: SqlEntityManager<MySqlDriver>,
  logger: Logger,
) {

  logger.info("Start fetchStatistics.");

  try {

    await getTotalStatisticsInfoCached(em);

    await getJobTotalCountCached(em);

    await getChargeRecordsTotalCountCached(em);

    lastFetched = new Date();

    const fetchSuccsess = true;

    return { fetchSuccsess };
  } catch (e) {
    logger.error("Error when fetching jobs. %o", e);
    throw e;
  }
}