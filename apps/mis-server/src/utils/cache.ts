/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * OpenSCOW is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import { MySqlDriver, QueryBuilder, SqlEntityManager } from "@mikro-orm/mysql";
import { QueryCache } from "src/entities/QueryCache";

export const queryWithCache = async ({ em, queryKeys, queryQb, cacheOptions }: {
  em: SqlEntityManager<MySqlDriver>
  queryKeys: string[],
  queryQb: QueryBuilder<any>,
  cacheOptions?: {
    maxAgeMilliseconds?: number,
    enabled?: boolean,
  },
}) => {
  const { maxAgeMilliseconds = 5 * 60 * 1000, enabled = true } = cacheOptions || {};

  if (!enabled) {
    return await queryQb.execute();
  }

  const queryKey = queryKeys.join(":");

  const queryCache = await em.findOne(QueryCache, { queryKey });

  const now = new Date();

  if (!queryCache) {
    const newResult = await queryQb.execute();
    const newQueryCache = new QueryCache({ queryKey, queryResult: newResult, timestamp: now });
    await em.persistAndFlush(newQueryCache);
    return newResult;
  }

  if ((now.getTime() - queryCache.timestamp.getTime()) > maxAgeMilliseconds) {
    const newResult = await queryQb.execute();
    queryCache.queryResult = newResult;
    queryCache.timestamp = now;
    await em.persistAndFlush(queryCache);
    return newResult;
  } else {
    return queryCache.queryResult;
  }

};
