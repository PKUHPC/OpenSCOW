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

interface Options {
  configPath: string;
  outputPath: string;
}

const EXAMPLE_CONFIG_PATH = "assets/config-example";

/**
 * Output sample config files to outputPath
 * @param options options
 */
export const extractConfig = (options: Options) => {

  if (fs.existsSync(options.outputPath)) {
    console.warn("Output path already exists, skipping extraction");
    return;
  }

  console.log("Output path is " + options.outputPath);
  fs.cpSync(EXAMPLE_CONFIG_PATH, options.outputPath, { recursive: true });
};
