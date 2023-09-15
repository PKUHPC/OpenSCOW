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

// 系统支持语言列表
export const SYSTEM_VALID_LANGUAGES = {
  ZH_CN: "zh_cn",
  EN: "en",
};


export type I18nStringType = string | {
  i18n: {
    default: string,
    zh_cn: string,
    en: string,
  }
}

export const getI18nConfigCurrentText =
(i18nConfigText: I18nStringType | undefined, languageId: string | undefined): string => {
  if (!i18nConfigText) {
    return "";
  }
  if (typeof i18nConfigText === "string") {
    return i18nConfigText;
  } else {

    if (!languageId) return i18nConfigText.i18n.default;
    switch (languageId) {
    case SYSTEM_VALID_LANGUAGES.EN:
      return i18nConfigText.i18n.en;
    case SYSTEM_VALID_LANGUAGES.ZH_CN:
      return i18nConfigText.i18n.zh_cn;
    default:
      return i18nConfigText.i18n.default;
    }
  }
};
