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
 * Compare the version of the current package.json and protos/package.json with the version of the last commit
 * If the version is changed, create a tag and push it to the remote repository
 */

import { execSync } from "child_process";
import { readFileSync } from "fs";

const exec = (cmd) => execSync(cmd, { stdio: "inherit", encoding: "utf-8" });

function getVersion(path) {
  const lastFile = execSync(`git --no-pager show HEAD^1:${path}`, { encoding: "utf-8" });

  const currentFile = readFileSync(path, { encoding: "utf-8" });

  const last = JSON.parse(lastFile).version;

  const current = JSON.parse(currentFile).version;

  return { last, current };
}

// Tag SCOW Release
let changed = false;
const rootVersion = getVersion("package.json");

if (rootVersion.current !== rootVersion.last) {
  changed = true;
  console.log("App version is changed from %s to %s", rootVersion.last, rootVersion.current);
  exec(`git tag -a v${rootVersion.current} -m 'SCOW Release v${rootVersion.current}'`);
} else {
  console.log("App version is not changed. Ignored");
}

// Tag SCOW API Release
const scowApiVersion = getVersion("protos/package.json");

if (scowApiVersion.current !== scowApiVersion.last) {
  changed = true;
  console.log("SCOW API version is changed from %s to %s", scowApiVersion.last, scowApiVersion.current);
  exec(`git tag -a api-v${scowApiVersion.current} -m 'SCOW API Release v${scowApiVersion.current}'`);
}

if (changed) {
  console.log("New Tag Created. Push tags.");
  exec("git push --tags");
}
