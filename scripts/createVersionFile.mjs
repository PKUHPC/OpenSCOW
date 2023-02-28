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

/**
 * Create a json file at the specified path
 * containing the commit number and tag number of current commit
 *
 * Usage:
 *   node scripts/createVersionFile.mjs [json file path]
 *
 *   e.g. node scripts/createVersionFile.mjs version.json
 */

import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";

let outputFile = process.argv[2] || "version.json";

const exec = (cmd) => execSync(cmd, { encoding: "utf-8" });

const tags = exec("git tag --points-at HEAD").split("\n");
const commit = exec("git rev-parse HEAD").trim();

const versionObject = {
  tag: tags[0] || undefined,
  commit,
};

writeFileSync(outputFile, JSON.stringify(versionObject));
