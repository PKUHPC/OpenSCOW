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
import { dump } from "js-yaml";
import { createComposeSpec } from "src/compose";
import { getInstallationConfig } from "src/config";
import { log } from "src/log";

interface Options {
  configPath: string;
  outputPath: string;
}

/**
 * Generate docker-compose.yml content from config
 * @param options config
 */
export const generateContent = (options: Pick<Options, "configPath">) => {
  const config = getInstallationConfig(options.configPath);

  const composeSpec = createComposeSpec(config);

  return composeSpec;

};

/**
 * Generate docker-compose.yml file on outputPath from config
 * @param options config
 */
export const generateDockerComposeYml = (options: Options) => {
  const spec = generateContent(options);

  const content = dump(spec);

  writeFileSync(options.outputPath, content, { encoding: "utf-8" });

  log("Generated docker-compose.yml at " + options.outputPath);
};
