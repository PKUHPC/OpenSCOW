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
import { FastifyReply, FastifyRequest } from "fastify";
import { join } from "path";
import { authConfig, otpStatusOptions } from "src/config/auth";
import { config, FAVICON_URL } from "src/config/env";
import { uiConfig } from "src/config/ui";


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


export async function bindOtpHtml(
  err: boolean, req: FastifyRequest, rep: FastifyReply,
  otp?: {
    sendEmailUI?: boolean,
    sendSucceeded?: boolean,
    redisUserInfoExpiration?: boolean,
    emailAddress?: string,
    qrcode?: string,
    otpSessionToken?: string,
    backToLoginUrl?: string,
    timeDiffNotEnough?: number,
  },
) {

  const hostname = parseHostname(req);
  const enableTotp = authConfig.otp.status !== otpStatusOptions.disabled;

  return rep.status(err ? 401 : 200).view("bindOtp.liquid", {
    cssUrl: join(config.BASE_PATH, config.AUTH_BASE_PATH, "/public/assets/tailwind.min.css"),
    faviconUrl: join(config.BASE_PATH, FAVICON_URL),
    backgroundColor: uiConfig.primaryColor?.defaultColor ?? DEFAULT_PRIMARY_COLOR,
    err,
    footerText: (hostname && uiConfig?.footer?.hostnameTextMap?.[hostname]) ?? uiConfig?.footer?.defaultText ?? "",
    enableTotp,
    ...otp,
  });

}
