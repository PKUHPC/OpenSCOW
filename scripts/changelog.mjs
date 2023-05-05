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

import { execSync } from "child_process";
import fm from "front-matter";
import { readdir, readFile } from "fs/promises";
import { join } from "path";

const VERSION = JSON.parse(await readFile("package.json")).version;

const CHANGESET_DIR = ".changeset";

const files = await readdir(CHANGESET_DIR);

const changes = {
  "portal-web": [],
  "portal-server": [],
  "mis-web": [],
  "mis-server": [],
  "auth": [],
  "cli": [],
  "gateway": [],
};

const exec = (cmd) => execSync(cmd, { encoding: "utf-8" });

for (const file of files) {
  if (!file.endsWith(".md") || file === "README.md") { continue; }
  const changesetFilePath = join(CHANGESET_DIR, file);

  const gitCommit = exec(`git log -n 1 --pretty=format:%H -- ${changesetFilePath}`);

  const fileContent = await readFile(changesetFilePath, "utf8");
  const content = fm(fileContent);

  for (const [scowPackage, type] of Object.entries(content.attributes)) {
    const part = scowPackage.substring("@scow/".length);
    if (part in changes) {
      changes[part].push({ type, content: content.body.trim(), gitCommit });
    }
  }
}

// sort
const typePriority = { "patch": 0, "minor": 1, "major": 2 };
Object.values(changes).forEach((x) => x.sort((a, b) => typePriority[b.type] - typePriority[a.type]));

console.log(changes);

// generate markdown

const getChangesetLine = (line) =>
  `[${line.type}]: ${line.content} (${line.gitCommit})`;

const changelogContent = `
## ${VERSION}

### 门户系统

`;


