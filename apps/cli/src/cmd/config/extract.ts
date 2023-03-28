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

import fs from "fs";
import { join } from "path";
import prompt from "prompts";
import { logger } from "src/log";



interface Options {
  configPath: string;
  outputPath: string;
}

const EXAMPLE_CONFIG_PATH = "assets/config-example";

/**
 * Output sample config files to outputPath
 * @param options options
 */
export const extractConfig = async (options: Options) => {

  const fullPath = join(process.cwd(), options.outputPath);

  logger.info("Output path is " + fullPath);

  if (fs.existsSync(options.outputPath)) {
    const answer = await prompt({
      type: "confirm",
      name: "continue",
      message: `Output path ${fullPath} already exists. Continue?`,
    });
    if (!answer.continue) {
      logger.debug("Selected no.");
      return;
    }
  }

  await fs.promises.cp(EXAMPLE_CONFIG_PATH, fullPath, { recursive: true });
};
