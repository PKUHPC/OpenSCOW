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

import React from "react";

import libWebEn from "./libWebEn";
import libWebZhCn from "./libWebZhCn";

export type LibWebTextsType = typeof libWebEn;
export type LibWebTextsKeys = keyof LibWebTextsType;

export const libWebLanguages: { [id: string]: LibWebTextsType } = {
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

const splitter = /(\{\})/;

export const getCurrentLangLibWebTextArgs = (
  languageId: string,
  key: LibWebTextsKeys,
  placeholderValues?: React.ReactNode[],
): string | React.ReactNode | undefined => {

  const currentLibWebTexts = libWebLanguages[languageId];
  const value = currentLibWebTexts[key];

  console.log("【placeholder】", placeholderValues);

  if (value && typeof value === "string") {
    if (placeholderValues && placeholderValues.length > 0) {
      // // 使用字符串模板进行插值
      // let replacedValue = value;
      // placeholderValues.forEach((placeholderValue, index) => {
      //   console.log("【index】", index, placeholderValue);
      //   replacedValue = replacedValue.replace("{}", String(placeholderValue));
      //   console.log("【replaceValue】", replacedValue);
      // });
      // return replacedValue;
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

      return array.filter((item) => item !== "{}"); // 过滤掉未替换的占位符
    } else {
      return value;
    }
  } else {
    return undefined as any;
  }

};
