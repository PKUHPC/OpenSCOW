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

import { writeFileSync } from "fs";
import { createComposeSpec } from "src/compose";
import { getInstallConfig } from "src/config/install";
import { log } from "src/log";
import { format } from "src/utils/formatter";

interface Options {
  configPath: string;
  outputPath: string;
  format: string;
}

/**
 * Generate docker-compose.yml file on outputPath from config
 * @param options config
 */
export const generateDockerComposeYml = (options: Options) => {

  const config = getInstallConfig(options.configPath);

  const spec = createComposeSpec(config);

  writeFileSync(options.outputPath, format(spec, options.format), { encoding: "utf-8" });

  log("Generated compose spec as %s at %s", options.format, options.outputPath);
};
