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

import { existsSync, promises as fsp } from "fs";
import { basename, join } from "path";
import prompt from "prompts";
import { debug, log } from "src/log";


interface Options {
  configPath: string;
  outputPath: string;
}

const SAMPLE_INSTALLATION = join(__dirname, "../../assets/install.yaml");
const SAMPLE_CONFIG_PATH = join(__dirname, "../../assets/config");

// fs.promise.cp throws error for config dir
async function copyWithWarning(src: string, dest: string) {

  async function copyFile(src: string, dest: string) {
    if (existsSync(dest)) {
      const answer = await prompt({
        type: "confirm",
        name: "continue",
        message: `Output ${dest} already exists. Overwrite?`,
      });
      if (!answer.continue) {
        debug("Selected no.");
        return;
      }

    }
    await fsp.copyFile(src, dest);
  }

  const destPath = join(dest, basename(src));
  if (!existsSync(destPath)) {
    await fsp.mkdir(destPath, { recursive: true });
  }

  const stat = await fsp.lstat(src);
  if (stat.isDirectory()) {
    const entries = await fsp.readdir(src, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = join(src, entry.name);
      if (entry.isDirectory()) {
        await copyWithWarning(srcPath, destPath);
      } else {
        await copyFile(srcPath, join(destPath, entry.name));
      }
    }
  } else {
    await copyFile(src, destPath);
  }
}

export const init = async (options: Options) => {

  const fullPath = join(process.cwd(), options.outputPath);

  log("Output path is %s. ", fullPath);

  await copyWithWarning(SAMPLE_INSTALLATION, fullPath);
  await copyWithWarning(SAMPLE_CONFIG_PATH, fullPath);
};
