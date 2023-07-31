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

import { FastifyReply, FastifyRequest } from "fastify";
import { join } from "path";
import { createCaptcha } from "src/auth/captcha";
import { authConfig, OtpStatusOptions } from "src/config/auth";
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


export async function serveLoginHtml(
  err: boolean, callbackUrl: string, req: FastifyRequest, rep: FastifyReply,
  verifyCaptchaFail?: boolean,
  verifyOtpFail?: boolean,
) {

  const hostname = parseHostname(req);
  const enableCaptcha = authConfig.captcha.enabled;
  const enableTotp = authConfig.otp?.enabled;

  // 显示绑定otp按钮：otp.enabled为true && (密钥存于ldap时 || (otp.type===remote && 配置了otp.remote.redirectUrl))
  const showBindOtpButton = authConfig.otp?.enabled && (authConfig.otp?.type === OtpStatusOptions.ldap
    || (!!authConfig.otp?.remote?.redirectUrl && authConfig.otp?.type === OtpStatusOptions.remote));
  const captchaInfo = enableCaptcha
    ? await createCaptcha(req.server)
    : undefined;

  return rep.status(
    verifyCaptchaFail ? 400 : err ? 401 : 200).view("login.liquid", {
    cssUrl: join(config.BASE_PATH, config.AUTH_BASE_PATH, "/public/assets/tailwind.min.css"),
    backgroundImage: join(config.BASE_PATH, config.AUTH_BASE_PATH,
      uiConfig?.auth?.backgroundImage || "/public/assets/background.png"),
    backgroundColor: uiConfig?.auth?.backgroundColor || "#9a0000",
    faviconUrl: join(config.BASE_PATH, FAVICON_URL),
    logoUrl: join(config.BASE_PATH, config.AUTH_BASE_PATH,
      uiConfig?.auth?.logo || "/public/assets/logos/logo.dark.svg"),
    callbackUrl,
    sloganColor: uiConfig?.auth?.sloganColor || "white",
    sloganTitle: uiConfig?.auth?.sloganTitle,
    sloganContentArr: uiConfig?.auth?.sloganContentArr,
    footerText: (hostname && uiConfig?.footer?.hostnameTextMap?.[hostname]) ?? uiConfig?.footer?.defaultText ?? "",
    err,
    ...captchaInfo,
    verifyCaptchaFail,
    enableCaptcha,
    enableTotp,
    showBindOtpButton,
    verifyOtpFail,
    otpBasePath: join(config.BASE_PATH, config.AUTH_BASE_PATH, "/public/otp"),
    refreshCaptchaPath: join(config.BASE_PATH, config.AUTH_BASE_PATH, "/public/refreshCaptcha"),
  });

}
