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

import { getInstallationConfig } from "src/config/installation";
import { log } from "src/log";
import { format } from "src/utils/formatter";

interface Options {
  configPath: string;
  format: string;
}

/**
 * Output sample config files to outputPath
 * @param options options
 */
export const viewInstall = (options: Options) => {
  const config = getInstallationConfig(options.configPath);
  log(format(config, options.format));
};
