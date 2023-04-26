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

import { omitConfigSpec } from "@scow/lib-config";
import { readFileSync } from "fs";
import { type config } from "src/env";

export function parsePlaceholder(str: string, values: Record<string, string>): string {
  return str.replace(/\$\{([a-zA-Z0-9_]+)\}/g, (_, p1) => values[p1] ?? "");
}

export function getNginxConfig(envConfig: typeof config) {

  const nginxConfTemplate = readFileSync("assets/nginx.conf", "utf8");

  const nginxConf = parsePlaceholder(nginxConfTemplate, omitConfigSpec(envConfig));

  return nginxConf;
}
