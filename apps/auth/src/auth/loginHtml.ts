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

import { DEFAULT_PRIMARY_COLOR } from "@scow/config/build/ui";
import { randomUUID } from "crypto";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { join } from "path";
import { authConfig } from "src/config/auth";
import { config, FAVICON_URL } from "src/config/env";
import { uiConfig } from "src/config/ui";
import svgCaptcha from "svg-captcha";

function parseHostname(req: FastifyRequest): string | undefined {

  if (!req.headers.referer) {
    return undefined;
  }

  try {
    const url = new URL(req.headers.referer);
    return url.hostname;
  } catch {
    return undefined;
  }
}


export async function serveLoginHtml(
  err: boolean, callbackUrl: string, req: FastifyRequest, rep: FastifyReply,
  f: FastifyInstance, verifyCodeFail?: boolean,
) {

  const hostname = parseHostname(req);
  const { enableCaptcha } = authConfig;

  let data = "";
  let token = "";
  if (enableCaptcha) {
    const options = {
      size: 4,
      ignorechars: "0oIi1l",
      noise: 3,
      color: true,
      background: "#cc9966",
    };

    const captcha = svgCaptcha.create(options);

    data = captcha.data;
    const text = captcha.text;
    token = randomUUID();
    await f.redis.set(token, text, "EX", 120);
  }




  return rep.status(
    verifyCodeFail ? 400 : err ? 401 : 200).view("login.liquid", {
    cssUrl: join(config.BASE_PATH, config.AUTH_BASE_PATH, "/public/assets/tailwind.min.css"),
    faviconUrl: join(config.BASE_PATH, FAVICON_URL),
    backgroundColor: uiConfig.primaryColor?.defaultColor ?? DEFAULT_PRIMARY_COLOR,
    callbackUrl,
    footerText: (hostname && uiConfig?.footer?.hostnameTextMap?.[hostname]) ?? uiConfig?.footer?.defaultText ?? "",
    err,
    data,
    token,
    verifyCodeFail,
    enableCaptcha,
  });

}
