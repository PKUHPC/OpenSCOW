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

import { I18nDicType, languageDic } from "src/models/i18n";

export const getLanguage = (languageId: string | undefined | null): I18nDicType => {
  const languages = ((languageId && languageId in languageDic)
    ? languageDic[languageId as keyof typeof languageDic]
    : undefined
  ) ?? languageDic.zh_cn;
  return languages;
};

export type I18nDicKeys = keyof I18nDicType;

const splitter = /(\{\})/;

export const getCurrentLangTextArgs = (
  languageItem: string,
  placeholderValues?: React.ReactNode[],
): string | React.ReactNode | undefined => {

  const value = languageItem;

  if (value && typeof value === "string") {
    if (placeholderValues && placeholderValues.length > 0) {
      // 使用正则表达式进行占位符替换
      const array = value.split(splitter) as React.ReactNode[];
      let ri = 0;

      let containsNonPrimitive = false;

      for (let i = 1; i < array.length; i += 2) {
        if (typeof placeholderValues[ri] === "object") {
          containsNonPrimitive = true;
        }
        array[i] = placeholderValues[ri++];
      }

      if (!containsNonPrimitive) {
        return array.join("");
      }

      return array.filter((item) => item !== "{}");
    } else {
      return value;
    }
  } else {
    return undefined as any;
  }

};
