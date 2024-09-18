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

import { Static, Type } from "@sinclair/typebox";

export const UiExtensionConfigSchema = Type.Union([
  Type.Object({ url: Type.String({ description: "扩展的URL" }) }),
  Type.Array(Type.Object({
    name: Type.String({ description: "UI扩展名" }),
    url: Type.String({ description: "扩展的URL" }),
  })),
]);

export type UiExtensionConfigSchema = Static<typeof UiExtensionConfigSchema>;

export const checkUiExtensionConfig = (config: UiExtensionConfigSchema) => {
  if (Array.isArray(config)) {
    // check name duplication
    const exists = new Set<string>();
    for (const { name } of config) {
      if (exists.has(name)) {
        throw new Error(`Multiple UI extensions has the same name: ${name}`);
      }
      exists.add(name);
    }
  }
};
