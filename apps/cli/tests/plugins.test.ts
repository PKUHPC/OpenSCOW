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

import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { readEnabledPlugins } from "src/plugin";
import { format } from "src/utils/formatter";
import { testBaseFolder } from "tests/utils";

const testPluginFolder = join(testBaseFolder, "plugins");

async function createPluginDir(id: string) {
  await mkdir(join(testPluginFolder, id), { recursive: true });
}

async function createPlugins() {
  // make mock plugins
  const plugin1Id = "plugin1";

  await createPluginDir(plugin1Id);

  const plugin2Id = "plugin2";
  await createPluginDir(plugin2Id);
  await writeFile(join(testPluginFolder, plugin2Id, "docker-compose.yml"), format({
    version: "3",
    services: [],
  }, "yaml"));
}

beforeEach(async () => {
  await createPlugins();
});

it("should read plugins", async () => {

  const plugins = await readEnabledPlugins(testPluginFolder, ["plugin1", "plugin2"]);

  expect(plugins).toEqual([
    { id: "plugin1" },
    { id: "plugin2", dockerComposeFilePath: join(testPluginFolder, "plugin2", "docker-compose.yml") },
  ]);
});
