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

import { Static, Type } from "@sinclair/typebox";

export type I18nType = {
  i18n: {
    default: string,
    zh_cn: string,
    en: string,
  }
}
export const I18nTypeSchema = Type.Object({
  default: Type.String({ description: "国际化类型默认值" }),
  en: Type.String({ description: "国际化类型英文值" }),
  zh_cn: Type.String({ description: "国际化类型简体中文值" }),
});

export type I18nTypeSchema = Static<typeof I18nTypeSchema>;
