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
import { getI18nConfigCurrentText, getLanguageCookie } from "@scow/lib-server/build/i18n";
import { FastifyReply, FastifyRequest } from "fastify";
import { join } from "path";
import { createCaptcha } from "src/auth/captcha";
import { authConfig, OtpStatusOptions, ScowLogoType } from "src/config/auth";
import { config, FAVICON_URL, LOGO_URL } from "src/config/env";
import { uiConfig } from "src/config/ui";
import { AuthTextsType, languages } from "src/i18n";
import { parseHostname } from "src/utils/parseHostname";


export async function serveLoginHtml(
  err: boolean, callbackUrl: string, req: FastifyRequest, rep: FastifyReply,
  verifyCaptchaFail?: boolean,
  verifyOtpFail?: boolean,
) {

  const hostname = parseHostname(req);

  console.log("123123", req.headers.referer);

  const enableCaptcha = authConfig.captcha.enabled;
  const enableTotp = authConfig.otp?.enabled;
  const logoPreferDarkParam = authConfig.ui?.logo.scowLogoType === ScowLogoType.light ? "false" : "true";

  // 显示绑定otp按钮：otp.enabled为true && (密钥存于ldap时 || (otp.type===remote && 配置了otp.remote.redirectUrl))
  const showBindOtpButton = authConfig.otp?.enabled && (authConfig.otp?.type === OtpStatusOptions.ldap
    || (!!authConfig.otp?.remote?.redirectUrl && authConfig.otp?.type === OtpStatusOptions.remote));
  const captchaInfo = enableCaptcha
    ? await createCaptcha(req.server)
    : undefined;

  // 获取当前语言ID及对应的登录页面文本
  const languageId = getLanguageCookie(req.raw);
  const authTexts: AuthTextsType = languages[languageId];

  // 获取sloganI18nText
  const sloganTitle = getI18nConfigCurrentText(authConfig.ui?.slogan.title, languageId);
  const sloganTextArr = authConfig.ui?.slogan.texts.map((text) => {
    return getI18nConfigCurrentText(text, languageId);
  });

  return rep.status(
    verifyCaptchaFail ? 400 : err ? 401 : 200).view("login.liquid", {
    authTexts: authTexts,
    cssUrl: join(config.BASE_PATH, config.AUTH_BASE_PATH, "/public/assets/tailwind.min.css"),
    eyeImagePath: join(config.BASE_PATH, config.AUTH_BASE_PATH, "/public/assets/icons/eye.png"),
    eyeCloseImagePath: join(config.BASE_PATH, config.AUTH_BASE_PATH, "/public/assets/icons/eye-close.png"),
    backgroundImagePath: join(config.BASE_PATH, config.PUBLIC_PATH,
      (hostname && authConfig.ui?.backgroundImage.hostnameMap?.[hostname])
      ?? authConfig.ui?.backgroundImage.defaultPath ?? "./assets/background.png"),
    backgroundFallbackColor: (hostname && authConfig.ui?.backgroundFallbackColor.hostnameMap?.[hostname])
      || authConfig.ui?.backgroundFallbackColor.defaultColor || "#8c8c8c",
    faviconUrl: join(config.BASE_PATH, FAVICON_URL),
    logoUrl: !!authConfig.ui?.logo.customLogoPath === false ?
      join(config.PORTAL_BASE_PATH, LOGO_URL + logoPreferDarkParam)
      : join(config.BASE_PATH, config.PUBLIC_PATH, authConfig.ui?.logo.customLogoPath ?? ""),
    logoLink: authConfig.ui?.logo.customLogoLink ?? "",
    callbackUrl,
    sloganColor: authConfig.ui?.slogan.color || "white",
    sloganTitle: sloganTitle || "",
    sloganTextArr: sloganTextArr || [],
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
