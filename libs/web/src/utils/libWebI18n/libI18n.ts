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

import libWebEn from "./libWebEn";
import libWebZhCn from "./libWebZhCn";

export type LibWebTextsType = typeof libWebEn;
export type LibWebTextsKeys = keyof LibWebTextsType;

export const libWebLanguages: Record<string, LibWebTextsType> = {
  en: libWebEn,
  zh_cn: libWebZhCn,
};

export const getCurrentLangLibWebText = (
  languageId: string,
  key: LibWebTextsKeys,
): string | undefined => {

  const currentLibWebTexts = libWebLanguages[languageId];
  const value = currentLibWebTexts[key];

  if (value && typeof value === "string") {
    return value;
  } else {
    return undefined as any;
  }

};



