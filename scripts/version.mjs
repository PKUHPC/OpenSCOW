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
 * Execute pnpm changeset version to bump package versions, and bump root package.json version
 */

import { execSync } from "child_process";
import fs from "fs";

const exec = (cmd) => execSync(cmd, { stdio: "inherit" });

exec("pnpm changeset version");

// update root package version
const readPackageJson = (path) => JSON.parse(fs.readFileSync(path, { encoding: "utf8" }));

const rootPackageJson = readPackageJson("./package.json");

// read version from a app package
const portalWebPackageJson = readPackageJson("./apps/portal-web/package.json");

console.log("App version is %s", portalWebPackageJson.version);
rootPackageJson.version = portalWebPackageJson.version;

// write back to root package.json
fs.writeFileSync("./package.json", JSON.stringify(rootPackageJson, null, 2));


