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

import { MySqlDriver, QueryBuilder, SqlEntityManager } from "@mikro-orm/mysql";
import { QueryCache } from "src/entities/QueryCache";


export const queryWithCache = async ({ em, queryKey, queryQb }: {
  em: SqlEntityManager<MySqlDriver>
  queryKey: string,
  queryQb: QueryBuilder<any>,
}) => {

  const queryCache = await em.findOne(QueryCache, {
    queryKey,
  });

  if (!queryCache) {
    const newResult = await queryQb.execute();
    const queryCache = new QueryCache({ queryKey, queryResult: newResult });
    await em.persistAndFlush(queryCache);
    return newResult;
  } else {
    return queryCache.queryResult;
  }

};
