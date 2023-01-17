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
 * Compare the version of the current package.json with the version of the last commit
 * If the version is changed, create a tag and push it to the remote repository
 */

import { execSync } from "child_process";
import { readFileSync } from "fs";

const exec = (cmd) => execSync(cmd, { stdio: "inherit", encoding: "utf-8" });

const lastPackageJson = execSync("git --no-pager show HEAD^1:package.json", { encoding: "utf-8" });

const lastVersion = JSON.parse(lastPackageJson).version;

const currentVersion = JSON.parse(readFileSync("package.json", { encoding: "utf-8" })).version;

if (lastVersion === currentVersion) {
  console.log("App version is not changed. Ignored");
  process.exit(0);
}

console.log("App version is changed from %s to %s", lastVersion, currentVersion);

exec(`git tag -a v${currentVersion} -m 'Release v${currentVersion}'`);
exec("git push --tags");


