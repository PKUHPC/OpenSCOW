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

import { parseKeyValue } from "@scow/lib-config";
import { randomUUID } from "crypto";
import { FastifyRequest } from "fastify";
import { authConfig, getAuthConfig } from "src/config/auth";
import { config } from "src/config/env";

const getMockUsers = () => {

  const configMockUsers = getAuthConfig();

  const envMockUsers = parseKeyValue(config.MOCK_USERS);

  return { ...configMockUsers.mockUsers, ...envMockUsers };
};

/**
 * 生成一个UUID，将此UUID以及对应的用户identityId保存到redis中，并返回token
 */
export async function cacheInfo(identityId: string, req: FastifyRequest): Promise<string> {

  const mockUsers = getMockUsers();

  if (mockUsers[identityId]) {
    req.log.info("Rewrite mock user %s to user %s", identityId, mockUsers[identityId]);
    identityId = mockUsers[identityId];
  }

  const token = randomUUID();

  await req.server.redis.set(token,
    identityId, "EX", authConfig.tokenTimeoutSeconds,
  );

  return token;

}
