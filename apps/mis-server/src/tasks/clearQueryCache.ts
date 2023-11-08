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

import { MySqlDriver, SqlEntityManager } from "@mikro-orm/mysql";
import { Logger } from "pino";
import { QueryCache } from "src/entities/QueryCache";

export async function clearQueryCache(
  em: SqlEntityManager<MySqlDriver>,
  logger: Logger,
) {

  logger.info("Clearing query cache...");
  const result = await em.createQueryBuilder(QueryCache).delete()
    .where({ timestamp: { $lt: new Date() } })
    .execute();
  logger.info(`Query cache cleared. Rows deleted: ${result.affectedRows}.`);
  return;
}
