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
import { getInstallationConfig } from "src/config/installation";
import { log } from "src/log";

interface Options {
  configPath: string;
  outputPath: string;
  format: string;
}

const formatters: Record<string, (value: any) => string> = {
  "json": JSON.stringify,
  "yaml": dump,
};

/**
 * Generate docker-compose.yml file on outputPath from config
 * @param options config
 */
export const generateDockerComposeYml = (options: Options) => {

  const config = getInstallationConfig(options.configPath);

  const spec = createComposeSpec(config);

  const formatter = formatters[options.format];

  if (!formatter) { throw new Error("Unknown format " + options.format); }

  const content = formatter(spec);

  writeFileSync(options.outputPath, content, { encoding: "utf-8" });

  log("Generated compose spec as %s at %s", options.format, options.outputPath);
};
