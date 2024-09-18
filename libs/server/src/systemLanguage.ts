/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * OpenSCOW is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import { HEADER_ACCEPT_VALID_LANGUAGES,
  I18nStringType, SYSTEM_VALID_LANGUAGES, SystemLanguageConfig } from "@scow/config/build/i18n";
import { IncomingMessage } from "http";
import { parseCookies } from "nookies";



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
 * 返回系统当前语言
 *
 * @param req
 * @param systemLanguageConfig
 * @returns
 */
export function getCurrentLanguageId(req: IncomingMessage | undefined,
  systemLanguageConfig: SystemLanguageConfig): string {
  // 如果系统不使用i18n，则直接使用defaultLanguage
  if (!systemLanguageConfig.isUsingI18n) {
    return systemLanguageConfig.defaultLanguage;
  }

  const cookies = parseCookies({ req });
  // 如果cookie设置了而且有效，就使用cookie
  if (cookies?.language) {
    const currentCookieLang = cookies.language;
    if (Object.values(SYSTEM_VALID_LANGUAGES).includes(currentCookieLang)) {
      return currentCookieLang;
    }
  }
  // 如果cookies不合法且autoDetectWhenUserNotSet为true则优先判断浏览器偏好
  if (systemLanguageConfig.autoDetectWhenUserNotSet) {
    const acceptLanguageHeader = req?.headers["accept-language"];
    if (acceptLanguageHeader) {
      const preferredLanguages = acceptLanguageHeader.split(",");
      if (preferredLanguages.length > 0) {
      // 遍历语言偏好列表
        for (const lang of preferredLanguages) {
          const preferredLanguage = lang.split(";")[0];
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
  }
  // 如果判断不出，或者autoDetectWhenUserNotSet为false则直接使用默认语言
  return systemLanguageConfig.defaultLanguage;
};

