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

import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { serveLoginHtml } from "src/auth/loginHtml";

export async function verifyCode(
  f: FastifyInstance, code: string, token: string, callbackUrl: string, req: FastifyRequest, res: FastifyReply) {

  const redisCode = await f.redis.get(token);
  console.log("redisCode", redisCode);
  if (code.toLowerCase() === redisCode?.toLowerCase())
    return true;

  await serveLoginHtml(false, callbackUrl, req, res, f, true);
  return false;
}
