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

import { SYSTEM_VALID_LANGUAGES } from "./languages";

export type I18nStringType = string | {
  i18n: {
    default: string,
    en?: string,
    zh_cn?: string,
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
