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
import { createCaptcha } from "src/auth/captcha";
import { authConfig, OtpStatusOptions } from "src/config/auth";
import { config, FAVICON_URL, LOGO_URL } from "src/config/env";
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


export async function serveLoginHtml(
  err: boolean, callbackUrl: string, req: FastifyRequest, rep: FastifyReply,
  verifyCaptchaFail?: boolean,
  verifyOtpFail?: boolean,
) {

  const hostname = parseHostname(req);
  const enableCaptcha = authConfig.captcha.enabled;
  const enableTotp = authConfig.otp?.type !== OtpStatusOptions.disabled && authConfig.otp?.type !== undefined;

  // 显示按钮绑定otp按钮：密钥存于ldap时 || 配置了redirectUrl
  const showBindOtpButton = authConfig.otp?.type === OtpStatusOptions.ldap
    || (!!authConfig.otp?.remote?.redirectUrl && authConfig.otp?.type === OtpStatusOptions.remote);
  const captchaInfo = enableCaptcha
    ? await createCaptcha(req.server)
    : undefined;

  return rep.status(
    verifyCaptchaFail ? 400 : err ? 401 : 200).view("login.liquid", {
    cssUrl: join(config.BASE_PATH, config.AUTH_BASE_PATH, "/public/assets/tailwind.min.css"),
    faviconUrl: join(config.BASE_PATH, FAVICON_URL),
    logoUrl: join(config.BASE_PATH, LOGO_URL),
    backgroundColor: uiConfig.primaryColor?.defaultColor ?? DEFAULT_PRIMARY_COLOR,
    callbackUrl,
    footerText: (hostname && uiConfig?.footer?.hostnameTextMap?.[hostname]) ?? uiConfig?.footer?.defaultText ?? "",
    err,
    ...captchaInfo,
    verifyCaptchaFail,
    enableCaptcha,
    enableTotp,
    showBindOtpButton,
    verifyOtpFail,
    refreshCaptchaPath: join(config.BASE_PATH, config.AUTH_BASE_PATH, "/public/refreshCaptcha"),
  });

}
