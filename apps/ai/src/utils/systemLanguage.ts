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

import { HEADER_ACCEPT_VALID_LANGUAGES, SYSTEM_VALID_LANGUAGES, SystemLanguageConfig } from "@scow/config/build/i18n";

export function getAiCurrentLanguageId(languageCookie: string | undefined,acceptLanguageHeader: string | null,
  systemLanguageConfig: SystemLanguageConfig): string {
  // 如果系统不使用i18n，则直接使用defaultLanguage
  if (!systemLanguageConfig.isUsingI18n) {
    return systemLanguageConfig.defaultLanguage;
  }
  // 如果cookie设置了而且有效，就使用cookie
  if (languageCookie) {
    const currentCookieLang = languageCookie;
    if (Object.values(SYSTEM_VALID_LANGUAGES).includes(currentCookieLang)) {
      return currentCookieLang;
    }
  }
  // 如果cookies不合法且autoDetectWhenUserNotSet为true则优先判断浏览器偏好
  if (systemLanguageConfig.autoDetectWhenUserNotSet) {
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
