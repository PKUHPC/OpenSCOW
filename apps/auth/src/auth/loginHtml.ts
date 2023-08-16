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


export async function serveLoginHtml(
  err: boolean, callbackUrl: string, req: FastifyRequest, rep: FastifyReply,
  verifyCaptchaFail?: boolean,
  verifyOtpFail?: boolean,
) {

  const enableCaptcha = authConfig.captcha.enabled;
  const enableTotp = authConfig.otp?.enabled;
  const logoPreferDarkParam = authConfig.ui?.logo.scowLogoType === "light" ? "false" : "true";

  // 显示绑定otp按钮：otp.enabled为true && (密钥存于ldap时 || (otp.type===remote && 配置了otp.remote.redirectUrl))
  const showBindOtpButton = authConfig.otp?.enabled && (authConfig.otp?.type === OtpStatusOptions.ldap
    || (!!authConfig.otp?.remote?.redirectUrl && authConfig.otp?.type === OtpStatusOptions.remote));
  const captchaInfo = enableCaptcha
    ? await createCaptcha(req.server)
    : undefined;

  return rep.status(
    verifyCaptchaFail ? 400 : err ? 401 : 200).view("login.liquid", {
    cssUrl: join(config.BASE_PATH, config.AUTH_BASE_PATH, "/public/assets/tailwind.min.css"),
    eyeImagePath: join(config.BASE_PATH, config.AUTH_BASE_PATH, "/public/assets/icons/eye.png"),
    eyeCloseImagePath: join(config.BASE_PATH, config.AUTH_BASE_PATH, "/public/assets/icons/eye-close.png"),
    backgroundImagePath: join(config.BASE_PATH, config.PUBLIC_PATH,
      authConfig.ui?.backgroundImagePath ?? "./assets/background.png"),
    backgroundFallbackColor: authConfig.ui?.backgroundFallbackColor || "#8c8c8c",
    faviconUrl: join(config.BASE_PATH, FAVICON_URL),
    logoUrl: authConfig.ui?.logo.customLogoPath === "" ?
      join(config.BASE_PATH, LOGO_URL + logoPreferDarkParam) : authConfig.ui?.logo.customLogoPath,
    logoLink: authConfig.ui?.logo.customLogoLink === "" ?
      "javascript:void(0);" : authConfig.ui?.logo.customLogoLink,
    callbackUrl,
    sloganColor: authConfig.ui?.slogan.color || "white",
    sloganTitle: authConfig.ui?.slogan.title || "",
    sloganTextArr: authConfig.ui?.slogan.texts || [],
    footerTextColor: authConfig.ui?.footerTextColor || "white",
    themeColor: uiConfig.primaryColor?.defaultColor ?? DEFAULT_PRIMARY_COLOR,
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
