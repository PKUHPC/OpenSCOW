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

import Redis, { RedisOptions } from "ioredis";
import { redisOptions } from "src/server/config/redis";

import { logger } from "./logger";

let redisClient: Redis | null = null;


export function getRedisClient(redisOptions: RedisOptions): Redis {
  if (!redisClient) {
    redisClient = new Redis(redisOptions);

    // 添加监听器，当进程即将退出时关闭连接
    process.on("beforeExit", () => {
      if (redisClient) {
        // 使用 void 操作符显式忽略 Promise
        void redisClient.quit();
        redisClient = null;
      }
    });
  }
  return redisClient;
}


export async function deleteKeys(keys: string[]) {
  try {
    // 删除指定 key 的数据
    if (redisOptions) {
      const redis = getRedisClient(redisOptions);
      const result = await redis.del(keys);
      logger.info(`Deleted ${result} keys`);
    }
  } catch (error) {
    logger.error("Error deleting key:", error);
  }
}
