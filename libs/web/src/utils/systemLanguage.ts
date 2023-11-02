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

import { HEADER_ACCEPT_VALID_LANGUAGES,
  I18nStringType, SYSTEM_VALID_LANGUAGES, SystemLanguageConfig } from "@scow/config/build/type";
import { IncomingMessage } from "http";
import { parseCookies } from "nookies";


// // 当前系统支持的header中可接受语言
// export const HEADER_ACCEPT_VALID_LANGUAGES = {
//   ZH: "zh",
//   ZH_CN: "zh_cn",
//   EN: "en",
//   EN_US: "en-US",
// };

// // 系统支持语言列表
// export const SYSTEM_VALID_LANGUAGES = {
//   ZH_CN: "zh_cn",
//   EN: "en",
// };

export function getI18nConfigCurrentText(
  i18nConfigText: I18nStringType | undefined, languageId: string | undefined): string {
  if (!i18nConfigText) {
    return "";
  }
  if (typeof i18nConfigText === "string") {
    return i18nConfigText;
  } else {

    // 当语言id或者对应的配置文本中某种语言不存在时，显示default的值
    if (!languageId) return i18nConfigText.i18n.default;
    switch (languageId) {
    case SYSTEM_VALID_LANGUAGES.EN:
      return i18nConfigText.i18n.en || i18nConfigText.i18n.default;
    case SYSTEM_VALID_LANGUAGES.ZH_CN:
      return i18nConfigText.i18n.zh_cn || i18nConfigText.i18n.default;
    default:
      return i18nConfigText.i18n.default;
    }
  }
};

/**
 * 获取当前语cookie中保存的语言信息或浏览器语言偏好
 *
 * @param req
 * @returns
 */
export function getLanguageCookie(req: IncomingMessage | undefined): string | undefined {

  // 检查 Cookie 中的语言是否合法
  const cookies = parseCookies({ req });

  if (cookies && cookies.language) {
    const currentCookieLang = cookies.language;
    if (Object.values(SYSTEM_VALID_LANGUAGES).includes(currentCookieLang)) {
      return currentCookieLang;
    }
  }

  // 如果 Cookie 不合法或不存在，尝试从请求头中获取语言偏好
  const acceptLanguageHeader = req?.headers["accept-language"];
  if (acceptLanguageHeader) {

    const preferredLanguages = acceptLanguageHeader.split(",");
    if (preferredLanguages.length > 0) {
      // 遍历语言偏好列表
      for (const preferredLanguage of preferredLanguages) {
        // 判断偏好语言中的语言是否合法
        if (Object.values(HEADER_ACCEPT_VALID_LANGUAGES).includes(preferredLanguage)) {
          switch (preferredLanguage) {

          case HEADER_ACCEPT_VALID_LANGUAGES.ZH_CN:
          case HEADER_ACCEPT_VALID_LANGUAGES.ZH:
            return SYSTEM_VALID_LANGUAGES.ZH_CN;

          case HEADER_ACCEPT_VALID_LANGUAGES.EN_US:
          case HEADER_ACCEPT_VALID_LANGUAGES.EN:
            return SYSTEM_VALID_LANGUAGES.EN;

          default:
            break;
          }
        }
      }
    }
  }

  return undefined;
}

/**
 * 根据系统语言自定义配置信息返回系统初始语言
 *
 * @param cookieLanguage
 * @param systemLanguageConfig
 * @returns
 */
export function getInitialLanguage(cookieLanguage: string | undefined,
  systemLanguageConfig: SystemLanguageConfig): string {

  // 使用国际化，且跟随系统语言， 且cookie中保存的语言或浏览器偏好为合法语言
  // 则使用cookie中保存的语言或浏览器偏好
  if (systemLanguageConfig.isUsingI18n && systemLanguageConfig.autoDetect && cookieLanguage) {
    return cookieLanguage;
  }
  // 其他情况，则使用指定的默认语言
  return systemLanguageConfig.defaultLanguage;

};

/**
 * 返回Server端的当前语言id，如果获取到了已保存的语言信息则读取语言信息，没有则返回系统默认语言
 *
 * @param req
 * @param systemLanguageConfig
 * @returns
 */
export function getServerCurrentLanguageId(req: IncomingMessage | undefined,
  systemLanguageConfig: SystemLanguageConfig): string {

  let cookieLanguage: string | undefined = undefined;
  const cookies = parseCookies({ req });

  if (cookies && cookies.language) {
    const currentCookieLang = cookies.language;
    if (Object.values(SYSTEM_VALID_LANGUAGES).includes(currentCookieLang)) {
      cookieLanguage = currentCookieLang;
    }
  }
  const defaultLanguage = systemLanguageConfig.defaultLanguage;

  return cookieLanguage ? cookieLanguage : defaultLanguage;
};
