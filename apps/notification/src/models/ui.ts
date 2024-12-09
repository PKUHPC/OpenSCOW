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

export const UiConfigSchema = Type.Object({
  primaryColor: Type.Optional(Type.Object({
    defaultColor: Type.String({ description: "默认主题色" }),
    hostnameMap: Type.Optional(Type.Record(Type.String(), Type.String(),
      { description: "根据域名(hostname，不包括port)不同，应用的主题色" })),
    darkModeColor: Type.Optional(Type.String({ description: "黑暗模式下主题色" })),
  })),

  defaultPrimaryColor: Type.String({ description: "默认主题色" }),
});

export type UiConfigSchema = Static<typeof UiConfigSchema>;
