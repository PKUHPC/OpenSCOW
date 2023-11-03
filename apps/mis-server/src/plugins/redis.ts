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

import { plugin } from "@ddadaal/tsgrpc-server";
import { QueryBuilder } from "@mikro-orm/mysql";
import Redis from "ioredis";
import { config } from "src/config/env";
import { misConfig } from "src/config/mis";

export const redis = config.REDIS_BUILTIN ? new Redis(misConfig.redisUrl) : new Redis({
  port: config.REDIS_PORT,
  host:config.REDIS_HOST,
  username: config.REDIS_USER_NAME ?? undefined,
  password: config.REDIS_PASSWORD ?? undefined,
  db: +config.REDIS_DB ?? undefined,
  keyPrefix: "mis:server",
});

export const redisPlugin = plugin(async (server) => {

  server.addCloseHook(async () => {
    redis.disconnect();
  });

});

/**
 * Query with redis cache
 * @param redisKey redis key
 * @param queryQb query builder to get new results
 * @param expireTime expire time in seconds
 * @returns results from redis cache or new results from db
 */
export const queryWithRedisCache = async ({ redisKey, queryQb, expireTime }: {
  redisKey: string,
  queryQb: QueryBuilder<any>,
  expireTime: number,
}) => {
  const results = await redis.get(redisKey);

  if (results) {
    return JSON.parse(results);
  } else {
    const newResult = await queryQb.execute();
    await redis.set(redisKey, JSON.stringify(newResult), "EX", expireTime);
    return newResult;
  }
};
