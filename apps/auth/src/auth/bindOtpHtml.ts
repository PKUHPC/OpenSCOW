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
import { getLanguageCookie } from "@scow/lib-server";
import { FastifyReply, FastifyRequest } from "fastify";
import { join } from "path";
import { config, FAVICON_URL } from "src/config/env";
import { uiConfig } from "src/config/ui";
import { AuthTextsType, languages } from "src/i18n";
import { getHostname } from "src/utils/getHostname";


export async function renderBindOtpHtml(
  err: boolean, req: FastifyRequest, rep: FastifyReply, callbackUrl: string,
  otp?: {
    sendEmailUI?: boolean,
    sendSucceeded?: boolean,
    tokenNotFound?: boolean,
    emailAddress?: string,
    qrcode?: string,
    otpSessionToken?: string,
    timeDiffNotEnough?: number,
    bindLimitMinutes?: number,
  },
) {

  const hostname = getHostname(req);

  // 获取当前语言ID及对应的绑定OTP页面文本
  const languageId = getLanguageCookie(req.raw);
  const authTexts: AuthTextsType = languages[languageId];

  return rep.status(err ? 401 : 200).view("/otp/bindOtp.liquid", {
    authTexts: authTexts,
    cssUrl: join(config.BASE_PATH, config.AUTH_BASE_PATH, "/public/assets/tailwind.min.css"),
    faviconUrl: join(config.BASE_PATH, FAVICON_URL),
    backgroundColor: (hostname && uiConfig.primaryColor?.hostnameMap?.[hostname])
      ?? uiConfig.primaryColor?.defaultColor ?? DEFAULT_PRIMARY_COLOR,
    err,
    callbackUrl,
    footerText: (hostname && uiConfig?.footer?.hostnameMap?.[hostname])
     ?? (hostname && uiConfig?.footer?.hostnameTextMap?.[hostname])
     ?? uiConfig?.footer?.defaultText ?? "",
    ...otp,
    otpBasePath: join(config.BASE_PATH, config.AUTH_BASE_PATH, "/public/otp"),
  });

}
