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
import { spawnSync } from "child_process";
import { cpSync, readFileSync, writeFileSync } from "fs";

import { config } from "./env";

export function parsePlaceholder(str: string, values: Record<string, string>): string {
  return str.replace(/\$\{([a-zA-Z0-9_]+)\}/g, (_, p1) => values[p1] ?? "");
}
const nginxConfTemplate = readFileSync("assets/nginx.conf", "utf8");

const nginxConf = parsePlaceholder(nginxConfTemplate, omitConfigSpec(config));

writeFileSync("/etc/nginx/default.conf", nginxConf);

cpSync("assets/includes", "/etc/nginx/includes", { recursive: true });

spawnSync("nginx", ["-g", "daemon off;"]);


