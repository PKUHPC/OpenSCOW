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

import { statSync } from "fs";
import { join } from "path";
import { createComposeSpec } from "src/compose";
import { getInstallConfig } from "src/config/install";
import { configPath, testBaseFolder } from "tests/utils";

it("creates log dir for fluentd", async () => {

  const config = getInstallConfig(configPath);

  const logDir = join(testBaseFolder, "logdir");

  config.log.fluentd = { logDir, image: "fluentd:v1.14.0-1.0" };

  createComposeSpec(config);

  const s = statSync(logDir);

  expect(s.mode).toBe(0o40777);
});
