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

import { Type } from "@sinclair/typebox";

import { CommonConfigSchema } from "./common";

// 创建配置文件中支持国际化文本文字项的配置类型
export const createI18nStringSchema = ({ description, defaultValue }: {
  description: string, defaultValue?: string
}) => {
  return Type.Union([
    Type.String(),
    Type.Object({
      i18n: Type.Object({
        default: Type.String({ description: "国际化类型默认值" }),
        en: Type.Optional(Type.String({ description: "国际化类型英文值" })),
        zh_cn: Type.Optional(Type.String({ description: "国际化类型简体中文值" })),
      }),
    }),
  ], { description, default: defaultValue });
};

// 当前系统支持的header中可接受语言
export const HEADER_ACCEPT_VALID_LANGUAGES = {
  ZH: "zh",
  ZH_CN: "zh-CN",
  EN: "en",
  EN_US: "en-US",
};

// 系统支持语言列表
export const SYSTEM_VALID_LANGUAGES = {
  ZH_CN: "zh_cn",
  EN: "en",
};

// 系统合法语言枚举值
export enum SYSTEM_VALID_LANGUAGE_ENUM {
  "zh_cn" = "zh_cn",
  "en" = "en",
}

export type SystemLanguage = CommonConfigSchema["systemLanguage"];

export interface SystemLanguageConfig {
  defaultLanguage: string,
  isUsingI18n: boolean,
  autoDetectWhenUserNotSet?: boolean
};


// 配置项文本国际化类型
export type I18nStringType = string | {
  i18n: {
    default: string,
    en?: string,
    zh_cn?: string,
  }
};

export interface I18nObject {
  i18n?: I18nObject_I18n | undefined;
}

export interface I18nObject_I18n {
  default: string;
  en?: string | undefined;
  zhCn?: string | undefined;
}
