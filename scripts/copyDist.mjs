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
 * Copy the required files of the app and the dependent libs to dist folder.
 * The files specified in the `files` fields of package.json of the app and libs will be copied.
 *
 * Usage:
  *  node scripts/copyDist.mjs [appDir...]
  *
  *  e.g. node scripts/copyDist.mjs apps/mis-server
 *
 * If appDir is not specified, the script will copy all apps and libs
 */

import fs from "node:fs";
import { join } from "node:path";

import { readWantedLockfile } from "@pnpm/lockfile-file";
import { globby } from "globby";

const APPS_BASE_PATH = "apps";
const DIST_BASE_PATH = "dist";

const ROOT_ITEMS = ["package.json", "pnpm-lock.yaml", "pnpm-workspace.yaml"];
const DEFAULT_COPY_ITEMS = ["package.json"];

const lockFile = await readWantedLockfile(".", {});

if (!lockFile) { throw new Error("No lockfile found"); }

// apps/mis-server
let appDirs = process.argv.slice(2);

if (appDirs.length === 0) {
  appDirs = ["portal-web", "portal-server", "auth", "mis-web", "mis-server", "gateway"]
    .map((x) => join(APPS_BASE_PATH, x));
}

/**
 * Get files specified in the packages
 * @param {string} packageRoot
 * @returns {Promise<string[]>}
 */
const getRequiredFiles = async (packageRoot) => {

  // get the package.json of the app
  const packageJson = JSON.parse(
    await fs.promises.readFile(`${packageRoot}/package.json`, { encoding: "utf-8" }),
  );

  // get the required files for the app
  if (!packageJson.files) {
    throw new Error("No files specified in package.json of " + packageRoot);
  }

  // filter out ts files
  packageJson.files.push("!**/*.ts");

  // find the files
  const files = await globby(packageJson.files, { cwd: packageRoot });

  return DEFAULT_COPY_ITEMS.concat(files);

};

// create dist folder
console.log("Creating dist folder ", DIST_BASE_PATH);
await fs.promises.mkdir(DIST_BASE_PATH, { recursive: true });

const cp = async (source, target) => {
  await fs.promises.cp(source, target, { recursive: true });
};

// Copy root items
for (const item of ROOT_ITEMS) {
  await cp(item, join(DIST_BASE_PATH, item));
}

const copiedLibs = new Set();

for (const appDir of appDirs) {

  console.log("Copying app " + appDir);

  // copy the app
  const requiredFiles = await getRequiredFiles(appDir);
  for (const file of requiredFiles) {

    const from = join(appDir, file);
    const to = join(DIST_BASE_PATH, appDir, file);

    await cp(from, to);
  }

  // copy lib depepdencies
  const snapshot = lockFile.importers[appDir];
  for (const [name, value] of Object.entries(snapshot.dependencies)) {
    if (name.startsWith("@scow/") && !copiedLibs.has(name)) {
      console.log("Copying lib " + name);
      const libDir = value.substring("link:../../".length);

      const requiredFiles = await getRequiredFiles(libDir);
      for (const file of requiredFiles) {

        const from = join(libDir, file);
        const to = join(DIST_BASE_PATH, libDir, file);

        await cp(from, to);
      }

      copiedLibs.add(name);
    }
  }
}
