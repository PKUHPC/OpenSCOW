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
import fm from "front-matter";
import fs, { existsSync } from "fs";
import { mkdir, readdir, readFile, writeFile } from "fs/promises";
import { join } from "path";

const exec = (cmd) => execSync(cmd, { stdio: "inherit" });


/**
 * Aggregate current changes by reading changeset files
 */
async function aggregateChanges() {

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
    "grpc-api": [],
  };

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

  return changes;
}


/**
 * Write changelog content to changelogs/${version}.md
 * @param {ReturnType<typeof aggregateChanges>} changes Aggregated changes
 * @param {string} version New version
 */
async function writeChangelog(changes, version) {

  const getChangesetLine = (line) =>
    `[${line.type}]: ${line.content}` +
  ` ([${line.gitCommit.substring(0, 8)}](https://github.com/PKUHPC/SCOW/commit/${line.gitCommit}))`;

  const generateContent = (changes) => changes.map(getChangesetLine).join("\n");

  const changelogContent = `
# SCOW ${version}

## 门户系统

### 前端 (portal-web)

${generateContent(changes["portal-web"])}

### 服务器 (portal-server)

${generateContent(changes["portal-server"])}

## 管理系统

### 前端 (mis-web)

${generateContent(changes["mis-web"])}

### 服务器 (mis-server)

${generateContent(changes["mis-server"])}

## 认证系统

${generateContent(changes["auth"])}

## CLI

${generateContent(changes["cli"])}

## 网关

${generateContent(changes["gateway"])}

## SCOW API和Hook

${generateContent(changes["grpc-api"])}
`;

  const CHANGELOG_BASE_PATH = "changelogs";

  if (!existsSync(CHANGELOG_BASE_PATH)) {
    await mkdir(CHANGELOG_BASE_PATH);
  }

  const CHANGELOG_PATH = join(CHANGELOG_BASE_PATH, `${version}.md`);
  await writeFile(CHANGELOG_PATH, changelogContent);
}

const changes = await aggregateChanges();

exec("pnpm changeset version");

// update root package version
const readPackageJson = (path) => JSON.parse(fs.readFileSync(path, { encoding: "utf8" }));

const rootPackageJson = readPackageJson("./package.json");

// read version from a app package
const portalWebPackageJson = readPackageJson("./apps/portal-web/package.json");

console.log("App version is %s. Root version is %s", portalWebPackageJson.version, rootPackageJson.version);

if (portalWebPackageJson.version === rootPackageJson.version) {
  console.log("App Version is not changed. Ignored.");
  process.exit(0);
}

console.log("App Version is changed. Update root package.json version");

rootPackageJson.version = portalWebPackageJson.version;

await writeFile("./package.json", JSON.stringify(rootPackageJson, null, 2));
await writeChangelog(changes, rootPackageJson.version);


