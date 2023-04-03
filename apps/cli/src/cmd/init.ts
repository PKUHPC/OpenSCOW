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

import { existsSync, promises } from "fs";
import { join } from "path";
import prompt from "prompts";
import { debug, log } from "src/log";


interface Options {
  configPath: string;
  outputPath: string;
}

const SAMPLE_INSTALLATION = "assets/install.yaml";
const SAMPLE_CONFIG_PATH = "assets/config";

async function cpWarn(file: string, targetDir: string) {

  const targetPath = join(targetDir, file);

  if (existsSync(targetPath)) {
    const answer = await prompt({
      type: "confirm",
      name: "continue",
      message: `Output path ${targetPath} already exists. Continue?`,
    });
    if (!answer.continue) {
      debug("Selected no.");
      return;
    }
  }

  await promises.cp(file, targetPath, { recursive: true });

}

export const init = async (options: Options) => {

  const fullPath = join(process.cwd(), options.outputPath);

  log("Output path is %s. ", fullPath);

  await cpWarn(SAMPLE_INSTALLATION, fullPath);
  await cpWarn(SAMPLE_CONFIG_PATH, fullPath);
};
