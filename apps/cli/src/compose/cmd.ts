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
import { createComposeSpec } from "src/compose";
import { InstallationConfigSchema } from "src/config/installation";
import { debug } from "src/log";

export function getAvailabelDockerComposeCommand() {

  // check if docker compose is available
  const r1 = spawnSync("docker compose", { shell: true, stdio: "ignore" });
  if (!r1.error) {
    return "docker compose";
  }

  // check if docker-compose is available
  const r2 = spawnSync("docker-compose", { shell: true, stdio: "ignore" });
  if (!r2.error) {
    return "docker-compose";
  }

  throw new Error("docker compose is not available, please install docker compose first.");
}

export function runComposeCommand(config: InstallationConfigSchema, args: string[]) {
  const dockerComposeCommand = getAvailabelDockerComposeCommand();

  debug("Using %s to run docker compose commands", dockerComposeCommand);

  const composeConfig = createComposeSpec(config);

  const resp = spawnSync(
    dockerComposeCommand,
    args,
    { input: JSON.stringify(composeConfig), shell: true, stdio: "inherit" },
  );

  return resp;

}
