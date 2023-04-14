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

import { Static, Type } from "@sinclair/typebox";
import { randomUUID } from "crypto";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { serveLoginHtml } from "src/auth/loginHtml";
import { authConfig } from "src/config/auth";
import svgCaptcha from "svg-captcha";

export interface CaptchaInfo {
  code: string;
  token: string;
}

export async function createCaptcha(f: FastifyInstance, key?: string): Promise<CaptchaInfo> {

  const options = {
    size: 4,
    ignorechars: "0oIi1l",
    noise: 3,
    color: true,
    background: "#cc9966",
  };

  const captcha = svgCaptcha.create(options);

  const data = captcha.data;
  const text = captcha.text;
  const token = key || randomUUID();
  await f.redis.set(token, text, "EX", 120);
  return { code: data, token };
  
}

export async function validateCaptcha(
  code: string, token: string, callbackUrl: string, req: FastifyRequest, res: FastifyReply,
) {

  if (!authConfig.captcha.enabled) { return true; }

  const redisCode = await req.server.redis.getdel(token);
  if (code.toLowerCase() === redisCode?.toLowerCase()) {
    return true;
  }

  await serveLoginHtml(false, callbackUrl, req, res, true);
  return false;
}

const bodySchema = Type.Object({
  token: Type.String(),
});
export function registerCaptchaRoute(f: FastifyInstance) {
  f.post<{ Body: Static<typeof bodySchema> }>(
    "/refreshCaptcha",
    {
      schema:{
        body: bodySchema,
      },
    },
    async (req, res) => {
      const { token } = req.body;
      const data = (await createCaptcha(f, token)).code;
      res.type("image/svg+xml").send(data);
    });
}
