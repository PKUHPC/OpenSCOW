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

import { existsSync } from "fs";
import { InstallConfigSchema } from "src/config/install";
import { logger } from "src/log";


export interface Plugin {
  id: string;

  dockerComposeFilePath?: string;
}


const readPlugin = async (pluginsDir: string, id: string): Promise<Plugin | undefined> => {

  const pluginDir = `${pluginsDir}/${id}`;

  const dockerComposeConfigPath = `${pluginDir}/docker-compose.yml`;

  return {
    id,
    dockerComposeFilePath: existsSync(dockerComposeConfigPath) ? dockerComposeConfigPath : undefined,
  };
};


export const readEnabledPlugins = async (installConfig: Pick<InstallConfigSchema, "plugins">) => {

  const plugins = [] as Plugin[];

  if (installConfig.plugins.enabledPlugins) {
    for (const pluginId of installConfig.plugins.enabledPlugins) {
      const plugin = await readPlugin(installConfig.plugins.pluginsDir, pluginId);

      if (plugin) {
        plugins.push(plugin);
      }
    }
  }

  logger.info("Loaded plugins: %o", plugins.map((x) => x.id));

  return plugins;
};
