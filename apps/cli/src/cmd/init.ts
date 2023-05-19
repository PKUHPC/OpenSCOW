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
import { logger } from "src/log";


interface Options {
  outputPath: string;
}

const initAssets = [
  join(__dirname, "../../assets/install.yaml"),
  join(__dirname, "../../assets/config"),
  join(__dirname, "../../assets/fluent"),
  join(__dirname, "../../assets/plugins"),
];

// fs.promise.cp throws error for config dir
async function copyWithWarning(src: string, dest: string) {

  const stat = await fsp.lstat(src);
  const destPath = join(dest, basename(src));

  if (stat.isDirectory()) {
    if (!existsSync(destPath)) {
      await fsp.mkdir(destPath, { recursive: true });
    }

    const entries = await fsp.readdir(src, { withFileTypes: true });
    for (const entry of entries) {
      const srcDir = join(src, entry.name);
      await copyWithWarning(srcDir, destPath);
    }
  } else {
    if (existsSync(destPath)) {
      const answer = await prompt({
        type: "confirm",
        name: "continue",
        message: `Output ${destPath} already exists. Overwrite?`,
      });
      if (!answer.continue) {
        logger.debug("Selected no.");
        return;
      }
    }

    logger.info("Copying %s to %s", src, destPath);
    await fsp.copyFile(src, destPath);
  }
}

export const init = async (options: Options) => {

  const fullPath = join(process.cwd(), options.outputPath);

  logger.info("Output path is %s. ", fullPath);

  for (const asset of initAssets) {
    await copyWithWarning(asset, fullPath);
  }

  logger.info("File initialization complete");
};
