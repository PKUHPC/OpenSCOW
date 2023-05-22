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

import { spawnSync } from "child_process";
import onDeath from "death";
import { unlinkSync, writeFileSync } from "fs";
import { dump } from "js-yaml";
import { createComposeSpec } from "src/compose";
import { InstallConfigSchema } from "src/config/install";
import { logger } from "src/log";
import { readEnabledPlugins } from "src/plugin";

export function getAvailabelDockerComposeCommand() {

  // check if docker compose is available
  const r1 = spawnSync("docker compose", { shell: true, stdio: "pipe" });
  if (!r1.error && !r1.output.toString().includes("is not a docker command")) {
    return "docker compose";
  }

  // check if docker-compose is available
  const r2 = spawnSync("docker-compose", { shell: true, stdio: "pipe" });
  if (!r2.error) {
    return "docker-compose";
  }

  throw new Error("docker compose is not available, please install docker compose first.");
}

export async function runComposeCommand(config: InstallConfigSchema, args: string[]) {

  const dockerComposeCommand = getAvailabelDockerComposeCommand();

  logger.debug("Using %s to run docker compose commands", dockerComposeCommand);

  const composeConfig = createComposeSpec(config);

  const filename = `docker-compose-${Date.now()}.yml`;

  writeFileSync(filename, dump(composeConfig), { encoding: "utf-8" });
  logger.debug("Generated " + filename);

  const clean = () => {
    unlinkSync(filename);
  };

  onDeath((arg) => {
    logger.debug("Received %s. Deleting compose file", arg);
    clean();
  });

  const params = ["-f", filename];

  const plugins = await readEnabledPlugins(config);

  for (const plugin of plugins) {
    if (plugin.dockerComposeFilePath) {
      logger.info("Using docker compose config from %s of plugin %s", plugin.dockerComposeFilePath, plugin.id);
      params.push("-f", plugin.dockerComposeFilePath);
    }
  }
  params.push(...args);

  try {
    spawnSync(
      dockerComposeCommand,
      params,
      { shell: true, stdio: "inherit" },
    );
  } finally {
    logger.debug("Process exited. Deleting compose file");
    clean();
  }
}
