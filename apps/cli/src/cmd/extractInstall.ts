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

import fs, { writeFileSync } from "fs";
import { dump } from "js-yaml";
import { join } from "path";
import prompt from "prompts";
import { getInstallationConfig } from "src/config/installation";
import { debug, log } from "src/log";


interface Options {
  configPath: string;
  outputPath: string;
}

export const extractInstallConfig = async (options: Options) => {

  const fullPath = join(process.cwd(), options.outputPath);

  log("Output path is " + fullPath);

  if (fs.existsSync(options.outputPath)) {
    const answer = await prompt({
      type: "confirm",
      name: "continue",
      message: `Output path ${fullPath} already exists. Continue?`,
    });
    if (!answer.continue) {
      debug("Selected no.");
      return;
    }
  }

  const config = getInstallationConfig(options.configPath);

  writeFileSync(fullPath, dump(config), { encoding: "utf-8" });
};
