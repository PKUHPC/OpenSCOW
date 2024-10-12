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

import { FastifyRequest } from "fastify";

/**
 * 删除与用户 identityId 相关的所有 Redis token
 */
export async function deleteUserTokens(identityId: string, req: FastifyRequest): Promise<void> {
  const redis = req.server.redis;
  const stream = redis.scanStream(); // 扫描所有 Redis 键

  try {
    const promises: Promise<void>[] = [];

    for await (const keys of stream) {
      for (const key of keys) {
        const storedIdentityId = await redis.get(key);
        if (storedIdentityId === identityId) {
          promises.push(redis.del(key).then(() => {}));
        }
      }
    }

    await Promise.all(promises); // 等待所有的异步删除操作完成
    req.log.info(`Successfully deleted all tokens related to identityId ${identityId}`);
  } catch (err) {
    req.log.error("Error while deleting Redis tokens:", err);
    throw new Error(`Failed to delete Redis tokens for identityId ${identityId}:
       ${err instanceof Error ? err.message : String(err)}`);
  }
}
